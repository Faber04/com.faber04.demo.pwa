interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = 'ts' }: CodeBlockProps) {
  return (
    <div className="code-block">
      <span className="code-lang">{language}</span>
      <pre><code>{code.trim()}</code></pre>
    </div>
  )
}
