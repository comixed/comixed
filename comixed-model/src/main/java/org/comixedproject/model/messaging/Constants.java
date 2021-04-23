package org.comixedproject.model.messaging;

/**
 * <code>Constants</code> is a namespace for constant values used by the messaging system.
 *
 * @author Darryl L. Pierce
 */
public interface Constants {
  /** Message sent to start the process of loading comic formats for a browsers. */
  String LOAD_COMIC_FORMATS = "comic-format.load";

  /** Topic which receives the set of comic formats. */
  String COMIC_FORMAT_UPDATE_TOPIC = "/topic/comic-format.update";

  /** Message sent to start loading scan types. */
  String LOAD_SCAN_TYPES = "scan-types.load";

  /** Topic which receives scan type updates. */
  String SCAN_TYPE_UPDATE_TOPIC = "/topic/scan-type.update";

  /** Topic which receives comic updates in real time. */
  String COMIC_LIST_UPDATE_TOPIC = "/topic/comic-list.update";

  /** Topic which receives blocked page updates in real time. */
  String BLOCKED_PAGE_LIST_UPDATE_TOPIC = "/topic/blocked-page-list.update";

  /** Topic which receives blocked page removals in real time. */
  String BLOCKED_PAGE_LIST_REMOVAL_TOPIC = "/topic/blocked-page-list.removal";

  /** Topic which receives updates on the current user." */
  String CURRENT_USER_UPDATE_TOPIC = "/topic/user/current";

  /** Topic which receives notices when last read entries are updated. */
  String LAST_READ_UPDATE_TOPIC = "/topic/last-read-list.update";

  /** Topic which receives notices when last read entries are removed. */
  String LAST_READ_REMOVAL_TOPIC = "/topic/last-read-list.removal";
}
