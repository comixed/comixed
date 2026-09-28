import { createFeature, createReducer, on } from '@ngrx/store';
import {
  readingListUploaded,
  uploadReadingList,
  uploadReadingListFailed
} from '../actions/upload-reading-list.actions';

export const UPLOAD_READING_LIST_FEATURE_KEY = 'upload_reading_list_state';

export interface UploadReadingListState {
  uploading: boolean;
}

export const initialState: UploadReadingListState = { uploading: false };

export const reducer = createReducer(
  initialState,

  on(uploadReadingList, state => ({ ...state, uploading: true })),
  on(readingListUploaded, state => ({ ...state, uploading: false })),
  on(uploadReadingListFailed, state => ({ ...state, uploading: false }))
);

export const uploadReadingListFeature = createFeature({
  name: UPLOAD_READING_LIST_FEATURE_KEY,
  reducer
});
