package org.comixed.utils;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

@Component
public class Utils {
  protected final Logger logger = LoggerFactory.getLogger(this.getClass());

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
