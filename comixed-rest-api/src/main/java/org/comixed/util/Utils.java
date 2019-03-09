
package org.comixed.util;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class Utils
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public String createHash(byte[] bytes)
    {
        String result = "";
        MessageDigest md;
        try
        {
            md = MessageDigest.getInstance("MD5");
            md.update(bytes);
            result = new BigInteger(1, md.digest()).toString(16).toUpperCase();
        }
        catch (NoSuchAlgorithmException error)
        {
            this.logger.error("Failed to generate hash", error);
        }
        this.logger.debug("Returning: " + result);
        return result;
    }
}
