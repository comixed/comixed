package org.comixedproject.opds.model;

import lombok.NonNull;

/**
 * <code>OPDSAcquisitionFeedContent</code> provides an implementation of {@link OPDSFeedContent} for
 * an acquisiton feed.
 *
 * @author Darryl L. Pierce
 */
public class OPDSAcquisitionFeedContent extends OPDSFeedContent<String> {
  public OPDSAcquisitionFeedContent(@NonNull final String value) {
    super("text", value);
  }
}
