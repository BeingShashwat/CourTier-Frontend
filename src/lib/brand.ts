import type { Theme } from '@/store/themeStore'

export const brandIcons = {
  favicon: '/icons/courtier-favicon-32.svg',
  appIcon: (theme: Theme) =>
    theme === 'dark' ? '/icons/squareAppIcon512Dark.svg' : '/icons/courtier-rounded-app-icon-512.svg',
  iconOnly: (theme: Theme) =>
    theme === 'dark' ? '/icons/squareAppIcon512Dark.svg' : '/icons/courtier-icon-only-512.svg',
  horizontalLockup: (theme: Theme) =>
    theme === 'dark' ? '/icons/horizontallookupDark.svg' : '/icons/horizontallookup.svg',
  stackedLockup: (theme: Theme) =>
    theme === 'dark' ? '/icons/stackedlockupDark.svg' : '/icons/courtier-stacked-lockup.svg',
}
