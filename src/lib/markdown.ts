/**
 * Strip markdown formatting from text to get plain text
 * Useful for generating meta descriptions from markdown content
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return ''
  
  return (
    markdown
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove headings (# ## ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic markers
      .replace(/\*\*?/g, '')
      .replace(/__/g, '')
      // Remove links [text](url) -> keep only text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove image tags ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove inline code backticks
      .replace(/`([^`]+)`/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove blockquotes
      .replace(/^>\s*/gm, '')
      // Remove horizontal rules
      .replace(/^---+$/gm, '')
      // Remove list markers
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Remove table formatting
      .replace(/\|/g, ' ')
      // Remove HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
  )
}

/**
 * Generate a plain text excerpt from markdown content
 * Returns the first N characters without breaking words
 */
export function generateExcerpt(
  markdown: string, 
  maxLength: number = 160
): string {
  const plainText = stripMarkdown(markdown)
  
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  // Find the last space within the limit to avoid cutting words
  const truncated = plainText.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}
