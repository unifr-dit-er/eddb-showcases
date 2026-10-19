'use client'

import Image from 'next/image'

interface SidebarMastheadProps {
  // Short name of the showcase, set in the serif of the press tone.
  title: string
  // One line in small capitals: subject · period.
  subtitle: string
}

// Top of the sidebar: the Unifr logo on its white band, then the showcase's
// name between two rules, newspaper-masthead style, and its subtitle. The
// logo file is `public/unifr.png` of each application.
export const SidebarMasthead = ({ title, subtitle }: SidebarMastheadProps) => (
  <>
    <div className="bg-white px-4 py-4 shrink-0">
      <Image
        src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/unifr.png`}
        alt="Université de Fribourg"
        width={340}
        height={84}
        className="h-10 w-auto object-contain"
        loading="eager"
        priority
      />
    </div>
    <div className="px-4 pt-4 pb-3 shrink-0">
      <div className="border-y-2 border-sidebar-foreground/70 py-2">
        <span className="block font-serif text-[1.75rem] font-semibold leading-none tracking-tight text-sidebar-foreground">
          {title}
        </span>
      </div>
      <p className="mt-1.5 text-[10px] tracking-[0.2em] uppercase text-sidebar-foreground/65">{subtitle}</p>
    </div>
    <div className="h-px bg-sidebar-border/60 shrink-0" />
  </>
)
