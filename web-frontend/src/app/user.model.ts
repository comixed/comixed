export class Authority {
  authority: string;

  constructor(authority: string) {
    this.authority = authority;
  }
}

export class User {
  name: string;
  authorities: Authority[];
  authenticated = false;

  constructor(
    name?: string,
    authorities?: Authority[],
    authenticated?: boolean
  ) {
    this.name = name;
    this.authorities = authorities;
    this.authenticated = authenticated;
  }
}
