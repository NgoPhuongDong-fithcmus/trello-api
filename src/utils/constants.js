import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'http://localhost:5173'
  // sau này deploy lên domain chính thức ...
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBISITE_DOMAIN_PRODUCTION : env.WEBISITE_DOMAIN_DEV

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 10