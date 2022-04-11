package org.comixedproject.opds.model;

/**
 * <code>OPDSAcquisitionFeed</code> provides a {@link OPDSFeed} that represents an acquisition feed.
 *
 * @author Darryl L. Pierce
 */
public class OPDSAcquisitionFeed extends OPDSFeed<OPDSAcquisitionFeedEntry> {
  public static final String ACQUISITION_FEED_LINK_TYPE =
      "application/atom+xml; profile=opds-catalog; kind=acquisition";

  public OPDSAcquisitionFeed(final String title) {
    super(title);
  }
}
