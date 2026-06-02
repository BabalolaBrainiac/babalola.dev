# Chasing 400s: A Week of Open Source Contributions

**Published:** May 2026

**Tags:** #OpenSource #SpringData #Java #REST #LangChain #Python #Leaflet #Documentation #HTTP #ErrorHandling

## Table of Contents

- [Why I Chase 400s](#why-i-chase-400s)
- [Spring Data REST: When 500 Steals 400s Seat](#spring-data-rest-when-500-steals-400s-seat)
  - [The Bug](#the-bug)
  - [Root Cause Analysis](#root-cause-analysis)
  - [The Fix](#the-fix)
  - [Why This Solution](#why-this-solution)
- [Leaflet: Documentation Rot and Temporal Language](#leaflet-documentation-rot-and-temporal-language)
- [LangChain: The Missing Metadata in Streaming](#langchain-the-missing-metadata-in-streaming)
- [Lessons Learned](#lessons-learned)
- [Conclusion](#conclusion)

---

## Why I Chase 400s

There is a particular kind of brokenness in HTTP APIs that has always bothered me. Not the dramatic failures, the cascading timeouts, the database connection pools draining to zero. Those are loud and they get attention. I am talking about the quiet wrongness of a 500 Internal Server Error that should have been a 400 Bad Request.

A 500 says: "I, the server, am broken. Something went wrong inside me that you could not have predicted or prevented." A 400 says: "You, the client, made a mistake. Your request is malformed, semantically invalid, or otherwise unacceptable." These are different contracts. When a server returns 500 for a client error, it is lying about where the fault lies. It is also hiding actionable information from the client, because 400 responses typically carry a body explaining what was wrong, while 500 responses typically do not.

I have spent enough time building and debugging REST APIs to know that status code accuracy is not pedantry. It is observability. It is client-side error handling. It is the difference between a retry loop that will never succeed and a user prompt that can actually fix the problem. A 500 on a malformed request is a server confessing a sin it did not commit.

This week I fixed one of these in Spring Data REST. I also cleaned up some documentation rot in Leaflet and started chasing a metadata bug in LangChain. Here is how it went.

## Spring Data REST: When 500 Steals 400s Seat

### The Bug

Spring Data REST exposes JPA repositories as HTTP resources. You can `GET /people` to list entities, `POST /people` to create one, `PATCH /people/123` to update. It also supports association resources: `/people/123/siblings` to manage related entities. For associations, the `Content-Type: text/uri-list` media type is valid: you POST a list of URIs pointing to the entities you want to associate.

The problem: when a client accidentally POSTs `Content-Type: text/uri-list` to a non-association endpoint, like `/people`, the server returns 500 Internal Server Error instead of 400 Bad Request.

This is exactly the wrongness I described above. The client sent a content type that does not match the endpoint's contract. That is a client error. The server should say so.

### Root Cause Analysis

To understand why this happens, you have to trace the request through Spring's message conversion and argument resolution pipeline.

When a request arrives at a controller method, Spring needs to convert the HTTP request body into a Java object that the method parameter expects. It does this by asking its configured `HttpMessageConverter` instances: "can you read this content type and produce this Java type?"

For `text/uri-list`, Spring Data REST registers `UriListHttpMessageConverter`. This converter does something important but slightly dangerous: it matches `text/uri-list` requests and returns a `CollectionModel` of links, regardless of what Java type the controller method parameter expects. The `canRead` check looks at the media type, not at whether the target type is actually a collection of links.

Here is the chain of failure:

1. Client POSTs `text/uri-list` to `/people` (a non-association endpoint expecting a `Person` entity)
2. `UriListHttpMessageConverter.canRead()` returns `true` because the media type is `text/uri-list`
3. The converter reads the body and produces a `CollectionModel` containing the parsed URIs
4. `PersistentEntityResourceHandlerMethodArgumentResolver.resolveArgument()` receives this `CollectionModel`
5. The resolver expects the target JPA entity type, e.g., `Person.class`
6. It tries to obtain a `PersistentPropertyAccessor` on the `CollectionModel`
7. `PersistentPropertyAccessor` throws `IllegalArgumentException` because a `CollectionModel` is not a JPA entity
8. Spring's `RepositoryRestExceptionHandler` does not have a specific mapping for this `IllegalArgumentException`
9. The exception bubbles up and becomes a 500 Internal Server Error

The formal way to describe this is a type safety violation at the message conversion boundary. The converter is contravariant with respect to the target type: it will read the input regardless of whether its output type matches what the caller expects. The resolver assumes that if a converter accepted the request, the resulting object will be compatible with the parameter type. That assumption fails here.

### The Fix

The fix is defensive validation in the argument resolver. After reading the object from the converter, check whether it is actually an instance of the expected domain type. If not, throw `HttpMessageNotReadableException`, which Spring already maps to 400 Bad Request.

```java
Object newObject = readWithMessageConverters(request, domainType, actualType);

if (!domainType.isInstance(newObject)) {
    throw new HttpMessageNotReadableException(
        String.format(ERROR_MESSAGE, domainType), request);
}
```

That is four lines. The `ERROR_MESSAGE` format is something like `"Request body cannot be converted to %s"`.

Why `HttpMessageNotReadableException`? Because it is the standard exception for "I received a request body but could not make sense of it in the context of what you asked for." And crucially, `RepositoryRestExceptionHandler` already maps it:

```java
@ExceptionHandler(HttpMessageNotReadableException.class)
public ResponseEntity<?> handleHttpMessageNotReadable(...) {
    return badRequest().body(...);
}
```

No new exception types. No new handler methods. Just a type check that bridges the gap between what the converter produced and what the resolver expected.

I also added a unit test, `rejectsRequestBodyIfConverterReturnsIncompatibleType`, which constructs a mock request with `text/uri-list` content and verifies that the resolver throws `HttpMessageNotReadableException` rather than allowing the type mismatch to propagate.

```java
@Test
void rejectsRequestBodyIfConverterReturnsIncompatibleType() {
    // given: a request that the converter will match but produce wrong type for
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.addHeader("Content-Type", "text/uri-list");
    request.setContent("http://example.com/1\n".getBytes(StandardCharsets.UTF_8));

    // when/then: resolver should reject with HttpMessageNotReadableException
    assertThatExceptionOfType(HttpMessageNotReadableException.class)
        .isThrownBy(() -> resolver.resolveArgument(...));
}
```

### Why This Solution

I considered three approaches before settling on this one.

**Option 1: Fix `UriListHttpMessageConverter.canRead()` to check the target type.**
This would mean the converter only matches when the target type is actually a collection or association type. The problem is that `canRead()` in the Spring converter interface does not receive the target class in all call paths, and changing the converter would be a broader behavioral change with potential ripple effects across other Spring Data modules. It is also not the converter's job to know about JPA entity semantics.

**Option 2: Fix `RepositoryRestExceptionHandler` to map `IllegalArgumentException` to 400.**
This would catch the symptom but it is far too broad. `IllegalArgumentException` is thrown in many legitimate internal-error contexts. Mapping it to 400 would mask real server bugs.

**Option 3: Add type validation in `PersistentEntityResourceHandlerMethodArgumentResolver`.**
This is what I chose. It is minimally invasive, semantically correct, and uses existing infrastructure. The resolver is exactly the component that knows what type it needs. If the converter produces something incompatible, the resolver is the right place to say "this request does not satisfy my contract." It follows the pattern of defensive validation that Spring Data already uses elsewhere in its argument resolvers.

Files changed:
- `PersistentEntityResourceHandlerMethodArgumentResolver.java` (+4 lines)
- `PersistentEntityResourceHandlerMethodArgumentResolverUnitTests.java` (+19 lines)

Sometimes the best fix is the smallest one. The 500 was not a deep framework bug. It was a missing guard clause at a trust boundary.

## Leaflet: Documentation Rot and Temporal Language

After the Spring fix, I turned to something lighter but no less important. Documentation rot is real, and it starts with time-relative language.

Leaflet's documentation had accumulated phrases like "currently added," "currently running," "is now not wanted," and "currently active" across sixteen files. These phrases are accurate the day they are written and misleading a year later. A feature that is "currently added" in 2024 reads like a recent change in 2026, which may or may not still be true. A plugin that "is now not wanted" implies a recent deprecation that may have happened three releases ago.

The fix was mechanical but principled: replace temporal language with timeless equivalents.

| Before | After |
|--------|-------|
| "currently added" | "added" |
| "currently running" | "running" |
| "is now not wanted" | "is no longer wanted" |
| "currently active" | "active" |

This matters for open source projects with long lifespans. Documentation is a contract with future readers, and time-relative language encodes an expiration date that nobody updates. The cost of this debt is confusion for new contributors who cannot tell whether a statement describes the present state or historical context.

The fix was merged across sixteen files. No behavior changed. But the documentation became slightly more durable.

## LangChain: The Missing Metadata in Streaming

The third issue is still open. I am investigating why `response_metadata` is dropped when using `ChatOpenAI.with_structured_output(method="json_schema").stream()`.

In LangChain, `response_metadata` carries HTTP-level information: `x-request-id`, token usage, model version, finish reason. Non-streaming calls preserve this metadata correctly. Streaming calls with structured output do not.

My current hypothesis is that the problem lives in the interaction between `BaseChatModel.stream()` and the structured output wrapper. When streaming is active, LangChain aggregates chunks as they arrive from the provider. In the structured output path, those chunks are parsed JSON fragments rather than raw LLM tokens. The aggregation logic appears to reconstruct the parsed object but drops the `response_metadata` dictionary that travels alongside chunks in the non-streaming path.

The non-streaming path probably sets `response_metadata` on the final `AIMessage` from the complete HTTP response headers. In the streaming path, the headers arrive once at the start of the stream, and the individual chunks may not carry them forward through the structured output parser.

I am tracing the call path through `with_structured_output`, the `_stream` implementation, and the chunk aggregation in `BaseChatModel`. The fix will likely involve ensuring that the first chunk's metadata (or the aggregated metadata across the stream) is propagated to the final result in the structured output path.

This one is not ready for a pull request yet. But that is part of the work too: understanding a codebase you did not write, tracing data flow through layers of abstraction, and identifying exactly where a value disappears. The fix will come. The investigation is the contribution for now.

## Lessons Learned

**Status codes are part of the contract.** A 500 that should be a 400 is not a minor bug. It breaks client error handling, misattributes fault, and degrades observability. I fixed this because I have been on the client side of this failure enough times to know how much it costs.

**Minimal changes at trust boundaries are often the right fix.** The Spring issue could have been fixed in the converter, the exception handler, or the resolver. The resolver was the narrowest scope with the most precise semantic match. When in doubt, validate at the boundary that knows what it needs.

**Documentation rot is silent debt.** Time-relative language is a small thing until you scale it across years and contributors. The Leaflet fix took minutes to implement and will prevent hours of confusion. Maintenance is not just code.

**Investigation is contribution.** The LangChain issue is not fixed yet, but the work of tracing a bug through unfamiliar code is real engineering. Not every contribution ships as a pull request. Some ship as a clear diagnosis.

**Open source rewards patience.** These three contributions span Java, JavaScript documentation, and Python. The common thread is reading code carefully, understanding the contract it promises, and fixing the gap between promise and behavior. That skill transfers across languages and ecosystems.

## Conclusion

A week of open source contributions is not about volume. It is about the depth of attention you bring to code that is not yours, finding the places where the contract is slightly broken, and fixing them with the smallest correct change.

The Spring Data REST fix was four lines and a test. It turned a lying 500 into an honest 400. The Leaflet fix was sixteen files of timeless language. The LangChain issue is still unfolding, a thread I am pulling through layers of streaming abstraction.

Each of these is different in scope and state, but they share a principle: the code we depend on is only as good as the attention we give it. Open source is not a spectator sport. If you use a library, you own a small share of its correctness. This week I paid my share.

---

*If you found this post useful, the Spring Data REST issue is [#1194](https://github.com/spring-projects/spring-data-rest/issues/1194), the Leaflet docs issue is [#8477](https://github.com/Leaflet/Leaflet/issues/8477), and the LangChain investigation is [#37421](https://github.com/langchain-ai/langchain/issues/37421). I will update this post when the LangChain fix ships.*
