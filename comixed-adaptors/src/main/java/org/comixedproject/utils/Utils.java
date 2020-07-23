package org.comixedproject.utils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

/**
 * <code>Utils</code> provides useful utility functions.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class Utils {
  public String createHash(byte[] bytes) {
    StringBuilder result = new StringBuilder(convertToHexString(DigestUtils.md5Digest(bytes)));
    while (result.length() < 32) result = result.insert(0, "0");
    return result.toString();
  }

  public String createHash(final InputStream inputStream) throws IOException {
    return convertToHexString(DigestUtils.md5Digest(inputStream));
  }

  private String convertToHexString(final byte[] content) {
    return new BigInteger(1, content).toString(16).toUpperCase();
  }

  /**
   * Deletes the xpecified file without raising an exception on failure.
   *
   * @param file the file
   * @return true if the file was deleted, false otherwise
   */
  public boolean deleteFile(File file) {
    log.debug("Deleting file: {}", file.getAbsolutePath());
    return FileUtils.deleteQuietly(file);
  }

  /**
   * Encodes the provided string.
   *
   * @param string the string the be encoded
   * @param charset the charset to use
   * @return the encoded string
   * @throws UnsupportedEncodingException if an error occurs
   */
  public String encodeURL(String string, String charset) throws UnsupportedEncodingException {
    return URLEncoder.encode(string, charset);
  }

  /**
   * Reads the content of the {@link InputStream} and converts it to a <code>String</code> using the
   * supplied {@link Charset}.
   *
   * @param stream the stream
   * @param charset the character set
   * @return the string
   * @throws IOException if an error occurs
   */
  public String streamToString(InputStream stream, Charset charset) throws IOException {
    return IOUtils.toString(stream, charset);
  }

  /**
   * Clears the contents of the specified directory.
   *
   * @param path the parent directory
   * @throws IOException if an error occurs
   */
  public void deleteDirectoryContents(String path) throws IOException {
    FileUtils.cleanDirectory(new File(path));
  }
}
