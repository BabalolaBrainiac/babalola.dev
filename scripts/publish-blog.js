require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function extractMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let title = '';
  let tagsLine = '';
  let extractedContent = content;

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].startsWith('# ')) {
      title = lines[i].replace('# ', '').trim();
    }
    if (lines[i].startsWith('**Tags:**')) {
      tagsLine = lines[i];
    }
  }

  const slug = path.basename(filePath, '.md');

  const tagsMatch = tagsLine.match(/#[\w-]+/g) || [];
  const tags = tagsMatch.map(tag => tag.substring(1));

  const wordCount = extractedContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const excerptMatch = extractedContent.match(
    /## [^\n]+\n\n([^.!?]+[.!?])/
  );
  const excerpt = excerptMatch
    ? excerptMatch[1].trim()
    : extractedContent
        .split('\n')
        .filter(line => !line.startsWith('#') && !line.startsWith('**'))
        .slice(0, 2)
        .join(' ')
        .trim()
        .substring(0, 160);

  return {
    title,
    slug,
    content: extractedContent,
    excerpt,
    tags,
    reading_time: readingTime,
    meta_description: excerpt,
    meta_keywords: tags.join(', '),
    og_title: title,
    og_description: excerpt
  };
}

async function publishBlog(filePath) {
  try {
    console.log(`Publishing blog post from: ${filePath}`);

    const metadata = await extractMetadata(filePath);

    console.log(`Title: ${metadata.title}`);
    console.log(`Slug: ${metadata.slug}`);
    console.log(`Tags: ${metadata.tags.join(', ')}`);
    console.log(`Reading time: ${metadata.reading_time} min`);

    const insertData = {
      title: metadata.title,
      slug: metadata.slug,
      content: metadata.content,
      excerpt: metadata.excerpt,
      tags: metadata.tags,
      reading_time: metadata.reading_time,
      published: true,
      author_id: 'cd1dfb9b-7f01-4c1f-84d4-48217b5f88de'
    };

    const { data, error } = await supabase.from('blog_posts').upsert(
      insertData,
      { onConflict: 'slug' }
    );

    if (error) {
      console.error('Error publishing blog:', error);
      process.exit(1);
    }

    console.log('Blog post published successfully!');
    console.log(`View at: https://babalola.dev/blog/${metadata.slug}`);
  } catch (err) {
    console.error('Failed to publish blog:', err);
    process.exit(1);
  }
}

const blogPath = process.argv[2] || './BLOG_POSTS/stack-migration-part-2-execution.md';
publishBlog(blogPath);
