package org.comixedproject.model.messaging;

/**
 * <code>Constants</code> is a namespace for constant values used by the messaging system.
 *
 * @author Darryl L. Pierce
 */
public interface Constants {
  /** Message sent to start the process of loading comics for a browser. */
  String LOAD_COMIC_LIST_MESSAGE = "comic-list.load";

  /** Topic which receives comic updates in real time. */
  String COMIC_LIST_UPDATE_TOPIC = "/topic/comic-list.update";
}
