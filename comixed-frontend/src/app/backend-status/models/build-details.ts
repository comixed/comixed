export interface BuildDetails {
  branch: string;
  buildHost: string;
  buildTime: Date;
  buildVersion: string;
  commitId: string;
  commitTime: Date;
  commitMessage: string;
  commitUser: string;
  commitEmail: string;
  dirty: boolean;
  remoteOriginUrl: string;
  jdbcUrl: string;
}
