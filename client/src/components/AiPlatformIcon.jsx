import { Bot, Code, Image, Video, NotebookPen, Wand2, Compass, Globe, Sparkles, Search, MessageCircle, Brain, Palette, GitBranch, CircleDot } from 'lucide-react'

// Mapping von KI-Plattform Namen zu Lucide Icons
const platformIcons = {
  'Claude': Brain,
  'ChatGPT': MessageCircle,
  'Gemini': Sparkles,
  'VS Code + Claude Code': Code,
  'Google AI Studio': Sparkles,
  'Freepik (Bilder)': Image,
  'Freepik (Videos)': Video,
  'NotebookLM': NotebookPen,
  'Nano Banana': CircleDot,
  'Perplexity': Search,
  'Midjourney': Palette,
  'DALL-E': Image,
  'Stable Diffusion': Wand2,
  'DeepSeek': Compass,
  'Qwen (China)': Globe,
  'Ernie Bot (China)': Bot,
  'Copilot': GitBranch,
  'Llama': Bot,
}

export default function AiPlatformIcon({ platform, className = "w-4 h-4", color }) {
  const Icon = platformIcons[platform] || Bot
  return <Icon className={className} style={{ color }} />
}

// Export für Badge-Komponente
export function AiPlatformBadge({ platform, color, showName = true, size = "sm" }) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5"
  }

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: color + '20',
        color: color
      }}
    >
      <AiPlatformIcon platform={platform} className={iconSizes[size]} color={color} />
      {showName && <span>{platform}</span>}
    </span>
  )
}
