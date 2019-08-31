export interface BuildDetails {
  branch: string;
  build_host: string;
  build_time: Date;
  build_version: string;
  commit_id: string;
  commit_time: Date;
  commit_message: string;
  commit_user: string;
  commit_email: string;
  dirty: boolean;
  remote_origin_url: string;
}
