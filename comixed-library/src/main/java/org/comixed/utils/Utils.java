package org.comixed.utils;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

@Component
@Log4j2
public class Utils {
  public String createHash(byte[] bytes) {
    return convertToHexString(DigestUtils.md5Digest(bytes));
  }

  public String createHash(final InputStream inputStream) throws IOException {
    return convertToHexString(DigestUtils.md5Digest(inputStream));
  }

  private String convertToHexString(final byte[] content) {
    return new BigInteger(1, content).toString(16).toUpperCase();
  }
}
