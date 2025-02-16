package org.comixedproject.adaptors.csv;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicpages.BlockedHash;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CsvAdaptorTest {
  private static final String TEST_PAGE_LABEL = "The blocked page label";
  private static final String TEST_PAGE_HASH = "The page hash";
  private static final String TEST_PAGE_THUMBNAIL = "The blocked page content encoded";
  private static final String LABEL = "LABEL";
  private static final String HASH = "HASH";
  private static final String SNAPSHOT = "SNAPSHOT";

  @InjectMocks private CsvAdaptor adaptor;

  private BlockedHash blockedHash =
      new BlockedHash(TEST_PAGE_LABEL, TEST_PAGE_HASH, TEST_PAGE_THUMBNAIL);
  private List<BlockedHash> blockedHashes = new ArrayList<>();

  @Test
  void encode_decode() throws IOException {
    blockedHashes.add(blockedHash);

    final byte[] encoded =
        adaptor.encodeRecords(
            blockedHashes,
            (index, model) -> {
              if (index == 0) {
                return new String[] {LABEL, HASH, SNAPSHOT};
              } else {
                return new String[] {model.getLabel(), model.getHash(), model.getThumbnail()};
              }
            });

    assertNotNull(encoded);

    adaptor.decodeRecords(
        new ByteArrayInputStream(encoded),
        new String[] {LABEL, HASH, SNAPSHOT},
        (index, row) -> {
          if (index == 0) {
            assertEquals(LABEL, row.get(0));
            assertEquals(HASH, row.get(1));
            assertEquals(SNAPSHOT, row.get(2));
          } else {
            assertEquals(TEST_PAGE_LABEL, row.get(0));
            assertEquals(TEST_PAGE_HASH, row.get(1));
            assertEquals(TEST_PAGE_THUMBNAIL, row.get(2));
          }
        });
  }
}
