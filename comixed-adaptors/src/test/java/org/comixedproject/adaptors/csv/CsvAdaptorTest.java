package org.comixedproject.adaptors.csv;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.blockedpage.BlockedPage;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class CsvAdaptorTest {
  private static final String TEST_PAGE_LABEL = "The blocked page label";
  private static final String TEST_PAGE_HASH = "The page hash";
  private static final String TEST_PAGE_SNAPSHOT = "The blocked page content encoded";
  private static final String LABEL = "LABEL";
  private static final String HASH = "HASH";
  private static final String SNAPSHOT = "SNAPSHOT";

  @InjectMocks private CsvAdaptor adaptor;

  private BlockedPage blockedPage =
      new BlockedPage(TEST_PAGE_LABEL, TEST_PAGE_HASH, TEST_PAGE_SNAPSHOT);
  private List<BlockedPage> blockedPages = new ArrayList<>();

  @Test
  public void testEncodeAndDecode() throws IOException {
    blockedPages.add(blockedPage);

    final byte[] encoded =
        adaptor.encodeRecords(
            blockedPages,
            (index, model) -> {
              if (index == 0) {
                return new String[] {LABEL, HASH, SNAPSHOT};
              } else {
                return new String[] {model.getLabel(), model.getHash(), model.getSnapshot()};
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
            assertEquals(TEST_PAGE_SNAPSHOT, row.get(2));
          }
        });
  }
}
