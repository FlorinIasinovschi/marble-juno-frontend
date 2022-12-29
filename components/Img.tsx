import { useState, useEffect } from 'react'

const Image = ({ className = '', src, defaultImage = '/default.png' }) => {
  const [imgSrc, setImgSrc] = useState(src)
  useEffect(() => {
    setImgSrc(src)
  }, [src])
  return (
    <img
      className={className}
      src={imgSrc}
      onError={() => setImgSrc(defaultImage)}
      alt="img"
    />
  )
}

export default Image
