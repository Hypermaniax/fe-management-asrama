import { marqueeItems } from '@/data/asrama'

export function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="flex items-stretch border-y-2 border-border bg-main text-main-foreground"
    >
      <span className="flex shrink-0 items-center border-r-2 border-border bg-accent-orange px-4 font-heading text-sm uppercase text-foreground">
        Asrama Kepri
      </span>
      <div className="flex-1 overflow-hidden py-4">
        <div className="marquee-track flex w-max">
          {[0, 1].map((k) => (
            <div
              key={k}
              className="flex shrink-0 items-center gap-8 px-4 font-heading text-base uppercase sm:text-lg"
            >
              {marqueeItems.map((item) => (
                <span key={item} className="flex items-center gap-8">
                  {item}
                  <span className="text-accent-orange">★</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
