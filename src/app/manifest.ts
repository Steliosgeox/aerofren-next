import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AEROFREN',
    short_name: 'AEROFREN',
    description: 'Εξαρτήματα Νερού & Αέρα',
    start_url: '/',
    display: 'standalone',
    background_color: '#03101d',
    theme_color: '#03101d',
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
