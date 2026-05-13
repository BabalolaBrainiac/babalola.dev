# I Read "Hidden Technical Debt in Machine Learning Systems". Here Is What Stuck.

**Published:** April 2026

**Tags:** #MLOps #MachineLearning #TechnicalDebt #SystemsDesign #MLSystems #LearningInPublic #SoftwareEngineering

## Table of Contents

- [The Part Nobody Warns You About](#the-part-nobody-warns-you-about)
- [What Makes ML Debt Different](#what-makes-ml-debt-different)
- [Complex Models Erode Boundaries](#complex-models-erode-boundaries)
  - [Entanglement and CACE](#entanglement-and-cace)
  - [Correction Cascades](#correction-cascades)
  - [Undeclared Consumers](#undeclared-consumers)
- [Data Dependencies Cost More Than Code Dependencies](#data-dependencies-cost-more-than-code-dependencies)
  - [Unstable Data Dependencies](#unstable-data-dependencies)
  - [Underutilized Data Dependencies](#underutilized-data-dependencies)
- [Feedback Loops](#feedback-loops)
  - [Direct Feedback Loops](#direct-feedback-loops)
  - [Hidden Feedback Loops](#hidden-feedback-loops)
- [ML System Anti-Patterns](#ml-system-anti-patterns)
  - [Glue Code](#glue-code)
  - [Pipeline Jungles](#pipeline-jungles)
  - [Dead Experimental Codepaths](#dead-experimental-codepaths)
  - [Abstraction Debt](#abstraction-debt)
- [Configuration Debt](#configuration-debt)
- [Dealing with the External World](#dealing-with-the-external-world)
- [How to Actually Pay This Debt](#how-to-actually-pay-this-debt)
- [Lessons Learned](#lessons-learned)
- [Conclusion](#conclusion)

---

## The Part Nobody Warns You About

You spend weeks training a model. Loss curves look good. Validation accuracy is solid. You ship it. Six months later, the model is quietly wrong in ways nobody can explain, a minor upstream data change broke three things you thought were unrelated, and two other services are consuming your model output without you knowing about it.

This is not a model problem. The model is fine. The system around it is falling apart.

In 2015, a group of engineers at Google published a paper called "Hidden Technical Debt in Machine Learning Systems." They were not talking about the kind of technical debt developers usually mean: missing tests, undocumented APIs, functions that need refactoring. They were describing something harder to see and harder to fix. Debt that lives at the system level, not the code level. Debt that accumulates silently and compounds faster than you expect.

I have been working through this paper as part of my MLOps learning and the core argument is this: the ML code itself, the training loop, the model architecture, the inference call, is typically a small fraction of the total system. The paper estimates it as a small box at the center of a much larger diagram. The rest of that diagram is data pipelines, serving infrastructure, monitoring, configuration, feature engineering, process management, and a mesh of dependencies that are invisible until they break.

That surrounding system is where the debt lives. And it behaves differently from every other kind of technical debt you have dealt with before.

## What Makes ML Debt Different

In traditional software, technical debt is usually a code problem. A function does too much. An abstraction leaks. A dependency is unpinned. The standard tools for managing this debt work because the system is, in principle, fully enumerable. You can statically analyze it. You can trace a call stack. You can write tests that verify behavior is preserved after a refactor.

ML systems break all of these assumptions.

The behavior of an ML system is not expressed purely in software logic. It is a product of the code, the training data, the feature distributions at inference time, the hyperparameters, the serving infrastructure, and the feedback between all of them. You cannot write a static analyzer for that. You cannot write a unit test that tells you whether a distributional shift in one upstream feature has corrupted the utility of a different feature. The system is partially defined outside the codebase.

This is what makes ML technical debt so expensive. The standard repayment mechanisms do not apply. And the debt does not wait.

## Complex Models Erode Boundaries

Encapsulation is one of the most valuable properties in software engineering. When you define a module with a clear interface, you can change the internals without affecting anything outside it. The boundary holds. You get predictable behavior, testable units, and the ability to reason about parts of a system in isolation.

ML models do not have this property. The reason is worth understanding precisely.

### Entanglement and CACE

Every feature-based ML model operates on a shared input space. Say your model is:

```
f(x₁, x₂, ..., xₙ) → y
```

Training finds a weight vector `w*` that minimizes a loss function over the joint distribution of all inputs:

```
w* = argmin_w  E[L(f(x; w), y)]
```

The critical word is "joint." The learned weights are not independent per-feature. They are a global optimum across the entire input distribution simultaneously. When you change the distribution of `x₁`, whether by adding new data, changing a preprocessing step, or retraining with a different source, the optimal `w*` shifts for every other parameter too. Even `wⱼ` for `j ≠ 1`, features you never touched.

The Google paper names this the CACE principle: **Changing Anything Changes Everything**.

This is different from how dependencies work in regular software. In a microservice, changing service A does not silently alter the behavior of service B unless they share a contract, and that contract is explicit. In an ML model, the "contract" between features is implicit in the learned weight distribution. Every feature is entangled with every other feature through the loss surface.

The practical consequence: you cannot improve one feature in isolation. A feature that looks redundant may be holding other features in their current learned positions. Remove it, and the model rebalances in ways you cannot predict without retraining. Add a new feature `xₙ₊₁`, and you are not just adding one new dimension, you are perturbing the joint distribution that all existing weights were calibrated against.

Anything that changes the input distribution triggers CACE. Features, of course. But also hyperparameters, data selection criteria, sampling strategies, convergence thresholds, even regularization constants. There are no truly isolated variables in a trained model.

### Correction Cascades

Say you have a model `Ma` that solves problem A, and there is a new requirement to solve a slightly different problem `A'`. The temptation is to build a correction model `Ma'` that takes `Ma`'s output as input and learns a small delta:

```
Ma'(x) = Ma(x) + δ(Ma(x))
```

This feels efficient. You are not training from scratch. You are reusing an existing asset. But what you have created is a dependency chain. `Ma'` is now coupled to `Ma`. Any change to `Ma`, a retrain, a weight update, a version bump, changes the input distribution that `Ma'` was trained on. And `Ma'` has no way to know this happened.

In large systems, these chains iterate. `Ma''` depends on `Ma'` which depends on `Ma`. You end up with a correction stack where debugging a failure in `Ma''` requires understanding changes three layers back. The paper compares this accurately to callback hell in JavaScript: technically functional, increasingly impossible to reason about.

If you ever find yourself in a correction cascade, the right move is to augment the original model `Ma` so it learns the required correction internally, rather than stacking another model on top. The dependency chain should be a property of the architecture decision, not an artifact of avoiding a retrain.

### Undeclared Consumers

A model that writes predictions to a log file or exposes them via an endpoint is broadcasting. Without access controls and explicit contracts, other systems will start consuming those predictions. Some will do so deliberately. Some will do so incidentally, because an engineer found a convenient signal and used it.

These undeclared consumers are dangerous for a specific reason: they create tight coupling without the coupling being visible to the team responsible for the model. When you retrain `M₀`, you do not know that three other services have taken a behavioral dependency on its output distribution. The moment the output distribution shifts, even in ways that represent an improvement to `M₀`'s primary objective, those services break.

This is the ML equivalent of a global mutable variable that everyone reaches into. In traditional software you would call it an antipattern immediately. In ML systems it happens silently.

The mitigation borrows from service design. Treat model outputs as a contract. Define service level agreements on what the output distribution is expected to look like. Gate downstream access through explicit consumers with versioned endpoints. Any system that reads model output should be registered, so that a change to the model triggers a compatibility check across all known consumers before the update ships.

## Data Dependencies Cost More Than Code Dependencies

In software, there are good tools for managing dependency debt. Package managers, semantic versioning, vulnerability scanners, static analyzers that trace import graphs. When a dependency becomes unstable or underutilized, you can identify it, pin it, or remove it with some confidence about what the impact will be.

Data dependencies in ML systems have no equivalent tooling. The dependencies are not declared in a manifest. They do not have version numbers. You cannot run a dependency audit and get a list of all the data sources your model relies on.

### Unstable Data Dependencies

Not all data sources are stable. Some are lookup tables maintained by another team. Some are the output of another model. Some come from a preprocessing pipeline that has its own bugs and update schedule.

When these sources change, the change is not surfaced in your codebase. There is no compiler error, no type mismatch, no failing import. The model continues to receive data, just different data. If the upstream change is gradual, the model degrades gradually. You may not notice until the degradation is significant.

The formal way to describe this is distributional shift. The model was trained on data distributed as `p_train(x, y)`. If the upstream source changes such that inference data is now distributed as `p_serve(x, y) ≠ p_train(x, y)`, the model is operating outside its training distribution. Its outputs are no longer reliable in the way that its validation metrics suggested they would be.

The mitigation requires monitoring the input distribution at serving time, not just tracking model outputs. If `p_serve(xᵢ)` begins drifting from the marginal distribution the model was trained on, that is a signal before accuracy degrades.

### Underutilized Data Dependencies

A different problem: features that were added at some point and never removed, even after the model improved and they stopped contributing meaningful signal.

You can quantify this with mutual information. For a feature `xᵢ` and target `y`, the mutual information `I(xᵢ; y)` measures how much knowing `xᵢ` reduces uncertainty about `y`:

```
I(xᵢ; y) = H(y) - H(y | xᵢ)
```

Where `H(y)` is the entropy of the target distribution and `H(y | xᵢ)` is the conditional entropy given the feature. A feature where `I(xᵢ; y) < ε` for some small threshold `ε` is contributing near-zero predictive signal.

These epsilon-features are not free. They introduce noise into the input distribution. They require maintenance. They require someone to understand why they exist. And critically, because of CACE, removing them is not straightforward: the rest of the model's weights are calibrated against a feature space that includes them.

The practical hygiene here is to audit features regularly, measure their contribution, and when a feature's contribution is below threshold, treat its removal as a planned migration with explicit evaluation, not a quick cleanup.

## Feedback Loops

### Direct Feedback Loops

A model that influences the actions taken in the world will influence the data it is later trained on. This is not a hypothetical edge case. It happens in almost every production ML system.

Consider a model that scores items for ranking. The items it ranks highly get more clicks. Click data becomes training signal. The model learns that previously-ranked items are good items. Its next version ranks similar items even higher. The cycle continues.

Formally, if `f_t` is the model at time `t` and `D_t` is the training distribution at time `t`:

```
D_{t+1} = g(f_t, D_t)
```

Where `g` is some function of the model's effect on the world. The model's next training distribution depends on its current decisions. The system is no longer being trained on ground truth, it is being trained on a distribution it participated in creating.

This is a feedback loop, and it is one of the harder properties to detect in an ML system because it is not visible in the code. The code might be correct. The training pipeline might be correct. The feedback is in the world, not the system.

### Hidden Feedback Loops

Worse than direct feedback loops are the ones you cannot see. Two models trained on data from the same domain will often influence each other indirectly, even if they share no explicit dependency. Model A influences user behavior, which changes the data distribution for model B, which changes model B's behavior, which changes user behavior that feeds back into model A's data.

Neither team is aware of the coupling. Both models will degrade in correlated, hard-to-explain ways.

The paper does not offer a clean algorithmic solution for this because there is not one. The mitigation is organizational: know what signals your model is affecting in the world, trace the paths from those effects back to your training data, and instrument them as explicit monitoring surfaces.

## ML System Anti-Patterns

### Glue Code

The research literature defines models in terms of architecture and training procedures. Production systems define models in terms of Python scripts that wrangle inputs into the right format, transform outputs into the format downstream expects, handle version mismatches, apply pre and post-processing, and paper over the edges where the model's actual behavior diverges from its specification.

This is glue code, and it proliferates in ML systems at a rate that makes traditional software codebases look clean. The reason is that general-purpose ML libraries are designed for generality. They are not designed for your data format, your feature encoding, your output schema, or your serving requirements. Every gap between what the library does and what your system needs gets filled with custom glue.

The cost is lock-in. When 95% of your ML pipeline is glue code holding together a specific library version, migrating to a better library, or upgrading the existing one, requires refactoring most of the system. The model itself might be portable. The system is not.

The mitigation is to aggressively minimize glue code by choosing libraries that are closer to your actual use case, and when glue is necessary, to isolate it behind clean abstractions so that the model and the serving infrastructure are decoupled.

### Pipeline Jungles

Data preparation pipelines grow over time. Every new feature adds a new preprocessing step. Every data quality issue adds a new cleaning pass. Every edge case adds a new branch.

Eventually you have a pipeline that nobody fully understands. It branches in ways that are no longer clearly motivated. Parts of it handle data sources that no longer exist. Other parts apply transformations that were correct for a previous model and may or may not be correct for the current one.

Pipeline jungles are expensive to maintain because every change to the pipeline requires understanding the full graph of transformations, and every model change requires re-evaluating whether the pipeline's assumptions still hold. The entanglement between pipeline and model is often as complex as the entanglement within the model itself.

A pipeline jungle is a CACE problem applied to data preparation. The right response, before it gets to jungle state, is to version the pipeline alongside the model and treat them as a single deployable unit. A model version and a pipeline version are not independent artifacts. They are a pair.

### Dead Experimental Codepaths

ML development involves experimentation. You try an architecture, it does not work, you move on. Except the code does not always move on with you.

Dead experimental codepaths accumulate in ML codebases because the cost of leaving them in is not immediately visible. There is no runtime error. The tests pass. But every dead path is a surface area for confusion. It suggests to the next engineer that this approach was tried and might be worth revisiting. It has to be mentally excluded from any refactoring. It introduces dependencies that might need to be maintained even though the code path is never executed.

The standard advice for this is aggressive cleanup: remove experimental code when the experiment concludes, not when you get around to it.

### Abstraction Debt

Traditional software has well-understood abstractions. A function, a class, a module, an interface. These are stable concepts with decades of tooling and best practices behind them.

ML systems do not have equivalent abstractions for many of their core concepts. What is the right abstraction for a feature? For a dataset version? For the relationship between a model and the pipeline that produced its training data? For the contract between a model and its consumers?

The absence of these abstractions means every team builds their own. The result is that concepts like "a trained model" or "a feature pipeline" mean different things in different parts of the same organization. Standardizing on them requires organizational work, not just technical work.

## Configuration Debt

Production ML systems have a lot of configurable values. Learning rates, thresholds, data sampling ratios, feature selection cutoffs, timeout values, batch sizes. In a well-maintained system, these are explicit, documented, and version-controlled. In practice, they accumulate.

Configuration debt in ML systems is particularly dangerous because configuration often encodes assumptions about the data distribution. A threshold that was calibrated against data from two years ago may be deeply wrong today. But it is in a config file, not in the model, and it does not show up in model evaluations.

The problem compounds when configuration is split across multiple systems: some in the training pipeline, some in the serving infrastructure, some in the monitoring layer, some hardcoded in application logic. A coherent view of the system's configuration requires reading all of these places, and the interactions between them are often not documented.

The principle here is: any value that encodes an assumption about the world, including the data distribution, should be treated with the same care as a model weight. It has the same risk profile. It should be monitored, versioned, and tested.

## Dealing with the External World

An ML system interacts with the world in ways that a traditional software system does not. It does not just serve requests; it makes predictions about distributions that evolve over time. The data it was trained on becomes less representative as the world changes. The signals it relies on acquire different meanings.

A threshold of 0.7 that was well-calibrated in 2023 might be systematically biased in 2026, not because anyone changed anything in the system, but because the distribution of inputs drifted. The system's assumptions about the world have a shelf life, and that shelf life is not encoded anywhere in the code.

The only practical solution is monitoring. Not just accuracy metrics, but distributional metrics: how has the distribution of each input feature changed since training? How has the distribution of model outputs changed? Where the answer is "significantly," you have a signal that the model's implicit assumptions about the world may no longer hold.

Statistical tests like population stability index (PSI) applied to input features give you a quantitative measure of drift:

```
PSI = Σᵢ (actual_pct_i - expected_pct_i) × ln(actual_pct_i / expected_pct_i)
```

A PSI below 0.1 generally indicates negligible distribution shift. Between 0.1 and 0.2 warrants attention. Above 0.2 is a strong signal that the feature distribution has changed meaningfully and the model should be retrained or the feature re-evaluated.

The point is not to memorize the threshold. The point is to instrument it. A model with no distribution monitoring is a model you are flying blind.

## How to Actually Pay This Debt

The paper's framing is useful here. Debt is not inherently bad. Taking on debt to ship faster is a legitimate engineering trade. The problem is not incurring debt; it is not having a plan to service it.

For ML systems, servicing this debt looks different from the standard software answer of "schedule a refactoring sprint."

**Treat data as a first-class dependency.** Every data source that a model depends on should be tracked the same way a code dependency is tracked: versioned, monitored for changes, and audited for stability. If you do not know what data your model depends on, you do not know what can break it.

**Make consumers explicit.** Any system that reads model output should be registered. Before a model update ships, run a check against all registered consumers and verify compatibility. Undeclared consumers are not a social problem to solve with documentation; they are an access control problem to solve with systems.

**Version pipelines with models.** A model checkpoint without its corresponding training pipeline is an incomplete artifact. Treat them as a pair. When you retrain, you should be able to reproduce the exact preprocessing and feature engineering that produced the training data.

**Instrument the distribution, not just the accuracy.** Accuracy metrics tell you how the model performs on a sample. Distribution metrics tell you whether the world the model was trained on still resembles the world it is operating in. Both are necessary. Only one of them is commonly implemented.

**Aggressively remove dead code and epsilon features.** The cost of removing something you are not using is lower than you think, because the thing is not being used. The cost of keeping it is higher than you think, because of CACE.

## Lessons Learned

Reading this paper changed how I think about what "maintaining an ML system" actually means.

**The model is not the system.** The model is a function. The system is the model plus the data pipeline that feeds it, the serving infrastructure that hosts it, the consumers that read it, the monitoring that watches it, and the configuration that parameterizes all of these. Thinking about "model quality" in isolation is like thinking about a function's correctness in a codebase where the function signature, its callers, and its test data can all change independently.

**CACE is not a slogan, it is an architectural reality.** In any feature-based model, there is no such thing as an isolated change. Every change to the input distribution, the feature set, or the hyperparameters is a global perturbation of the learned weight space. Treating ML system changes as bounded and local is the failure mode.

**Debt at the system level is harder to detect than debt at the code level.** A unit test can verify that a function's contract holds. There is no equivalent verification for "the input distribution to this model still resembles its training distribution." The absence of visible failures is not a signal of health in an ML system the way it is in traditional software.

**Data dependencies are invisible until they are not.** A code dependency that breaks gives you a compiler error or a test failure. A data dependency that breaks silently shifts the distribution your model was calibrated against. By the time you notice the degradation, significant drift may have occurred. Instrument early.

**Configuration is a model too.** Any threshold or parameter that encodes an assumption about the data distribution has the same risk profile as a model weight. It needs the same care.

## Conclusion

The paper I was reading, "Hidden Technical Debt in Machine Learning Systems," was published in 2015. The infrastructure has matured considerably since then, but the underlying problems have not gone away. If anything, as ML systems have gotten more embedded in production infrastructure, the consequences of ignoring this debt have gotten larger.

The practical takeaway for anyone building or maintaining ML systems is simple: the discipline you apply to your code needs to extend to your data, your pipelines, your configuration, and your monitoring. Not because of any single catastrophic failure mode, but because the entanglement between these components means that neglect in any one of them becomes a system-level property over time.

The CACE principle is a good shorthand to carry. Changing Anything Changes Everything. In traditional software, you can challenge that as an overstatement. In a trained model, it is a literal description of how the mathematics works.

The system around your model is not scaffolding. It is the system.

---

*This post is part of my series on building and understanding ML systems. I am working through a 20-week curriculum that goes from production ML fundamentals to GPU kernels and inference engines. Notes and trackers live in my workspace repo.*
