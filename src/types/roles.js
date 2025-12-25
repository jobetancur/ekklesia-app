export const ROLES = {
  EKKLESIA_ADMIN: 'EKKLESIA_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  SITE_ADMIN: 'SITE_ADMIN',
  TREASURER: 'TREASURER',
  SECRETARY: 'SECRETARY',
  LEADER: 'LEADER',
  MEMBER: 'MEMBER'
};

export const SCOPES = {
  GLOBAL: 'GLOBAL',   // Can access all organizations
  ORG: 'ORG',         // Can access all sites in their organization
  SITE: 'SITE',       // Can access only their assigned site
  PERSONAL: 'PERSONAL' // Can access only their own data
};

// Map roles to their scope
export const ROLE_SCOPES = {
  [ROLES.EKKLESIA_ADMIN]: SCOPES.GLOBAL,
  [ROLES.SUPER_ADMIN]: SCOPES.ORG,
  [ROLES.SITE_ADMIN]: SCOPES.SITE,
  [ROLES.TREASURER]: SCOPES.SITE,
  [ROLES.SECRETARY]: SCOPES.SITE,
  [ROLES.LEADER]: SCOPES.SITE,
  [ROLES.MEMBER]: SCOPES.PERSONAL
};
