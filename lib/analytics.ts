export interface ParsedUA {
  browser: string
  os: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
}

export function parseUserAgent(ua: string): ParsedUA {
  return {
    browser: extractBrowser(ua),
    os: extractOS(ua),
    deviceType: detectDeviceType(ua),
  }
}

function extractBrowser(ua: string): string {
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera'
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome'
  if (ua.includes('Safari/') && ua.includes('Version/')) return 'Safari'
  return 'Other'
}

function extractOS(ua: string): string {
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11'
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1'
  if (ua.includes('Windows NT 6.1')) return 'Windows 7'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS X')) return 'macOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Linux')) return 'Linux'
  return 'Other'
}

function detectDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (ua.includes('Mobile') || ua.includes('Android') && !ua.includes('Tablet')) return 'mobile'
  if (ua.includes('iPad') || ua.includes('Tablet')) return 'tablet'
  return 'desktop'
}

export function getDeviceType(screenWidth: number): 'desktop' | 'mobile' | 'tablet' {
  if (screenWidth < 768) return 'mobile'
  if (screenWidth < 1024) return 'tablet'
  return 'desktop'
}
