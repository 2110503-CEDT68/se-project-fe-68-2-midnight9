'use client'

import Image from 'next/image'
import { useState } from 'react'

type Props = {
  src?: string
  alt: string
  className?: string
}

export default function CampImage({ src, alt, className = '' }: Props) {
  const [imgSrc, setImgSrc] = useState(src && src.trim() !== '' ? src : '/default.png')

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={true}
      className={className}
      onError={() => {
        if (imgSrc !== '/default.png') setImgSrc('/default.png')
      }}
    />
  )
}
