import type { Transition, Variants } from 'motion/react'

export const DUR = {
  instant: 0.08,
  quick: 0.15,
  base: 0.2,
}

export const EASE_HARD: [number, number, number, number] = [0.2, 0, 0, 1]

export const springSnap: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 40,
  bounce: 0,
}

export const snapIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.quick, ease: EASE_HARD },
  },
}

export const snapStagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: DUR.instant },
  },
}

export const pressable = {
  whileHover: { y: -2 },
  whileTap: { x: 2, y: 2 },
}

export const popBadge: Variants = {
  hidden: { scale: 0.9 },
  visible: { scale: 1, transition: springSnap },
}

export const shakeX: Variants = {
  idle: { x: 0 },
  shake: { x: [0, -6, 6, -4, 4, 0], transition: { duration: DUR.base } },
}
