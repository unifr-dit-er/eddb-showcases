import {
  AudioLines,
  BookOpen,
  Clapperboard,
  FileText,
  Globe,
  Landmark,
  Library,
  Newspaper,
  Presentation,
  Rss,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  'Newspaper article': Newspaper,
  'Magazine article': BookOpen,
  'Journal article': BookOpen,
  'Audio recording': AudioLines,
  Film: Clapperboard,
  Website: Globe,
  'Blog post': Rss,
  Document: FileText,
  Report: ScrollText,
  Bill: Landmark,
  Book: Library,
  Presentation: Presentation,
  publication: FileText,
}

export const RecordTypeIcon = ({ type, className }: { type: string; className?: string }) => {
  const Icon = ICONS[type] ?? FileText
  return <Icon className={cn('h-3.5 w-3.5 shrink-0', className)} aria-hidden />
}
