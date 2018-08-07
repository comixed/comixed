/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.library.adaptors;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FilenameUtils;
import org.comixed.library.model.Comic;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * <code>FilenameScraperAdaptor</code> scrapes comic meta-information from the
 * filename for a comic.
 *
 * @author Darryl L. Pierce
 *
 */
@Component
public class FilenameScraperAdaptor
{
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    private static class RuleSet
    {
        private final Logger logger = LoggerFactory.getLogger(this.getClass());
        public final Pattern expression;
        public final int series;
        public final int volume;
        public final int issue;
        public int coverDate;
        public SimpleDateFormat dateFormat;

        public RuleSet(String expression, int series, int volume, int issue, int coverDate, String dateFormat)
        {
            this.expression = Pattern.compile(expression);
            this.series = series;
            this.volume = volume;
            this.issue = issue;
            this.coverDate = coverDate;
            this.dateFormat = new SimpleDateFormat(dateFormat);
            logger.debug("Creating ruleset: expression={} series={} volume={} issue={} coverDate={} dateFormat={}",
                         expression, series, volume, issue, coverDate, dateFormat);
        }

        public boolean applies(String filename)
        {
            return this.expression.matcher(filename).matches();
        }

        public String[] process(String filename)
        {
            this.logger.debug("Processing filename: {}", filename);
            Matcher matches = this.expression.matcher(filename);
            String[] result = new String[matches.groupCount() + 1];

            while (matches.find())
            {
                for (int index = 0;
                     index < result.length;
                     index++)
                {
                    result[index] = matches.group(index);
                    this.logger.debug("Setting index={} to {}", index, result[index]);
                }
            }

            return result;
        }

        public Date parseCoverDate(String dateString) throws ParseException
        {
            return this.dateFormat.parse(dateString);
        }
    }

    // SERIES Vol.VVVV #nnn (Month, YYYY)
    private static final RuleSet RULESET1 = new RuleSet("^(([\\w[\\s][,-]]+)?(\\sVol\\.))([0-9]{4}).*\\#([0-9]{1,5}).*\\(([a-zA-Z]+, [0-9]{4})\\).*$",
                                                        2, 4, 5, 6, "MMMMM, yyyy");
    // SERIES nnn (VVVV)
    private static final RuleSet RULESET2 = new RuleSet("^([\\w[\\s][,-]]+)\\s([0-9]{1,5})\\s+\\(([0-9]{4})\\).*$", 1,
                                                        3, 2, -1, "");
    // SERIES (VVVV)
    private static final RuleSet RULESET3 = new RuleSet("^([\\w[\\s][,-]]+)\\s+\\(([0-9]{4})\\).*$", 1, 2, -1, -1, "");
    private static final RuleSet[] RULESET = new RuleSet[]
    {RULESET1,
     RULESET2,
     RULESET3,};

    private boolean applyRule(Comic comic, String filename, RuleSet ruleset)
    {
        boolean result = false;

        if (ruleset.applies(filename))
        {
            String[] elements = ruleset.process(filename);
            if (ruleset.series >= 0)
            {
                comic.setSeries(elements[ruleset.series]);
            }
            if (ruleset.volume >= 0)
            {
                comic.setVolume(elements[ruleset.volume]);
            }
            if (ruleset.issue >= 0)
            {
                comic.setIssueNumber(elements[ruleset.issue]);
            }
            if (ruleset.coverDate != -1)
            {
                try
                {
                    comic.setCoverDate(ruleset.parseCoverDate(elements[ruleset.coverDate]));
                }
                catch (ParseException error)
                {
                    this.logger.error("Failed to parse date string: " + elements[ruleset.coverDate], error);
                }
            }
            result = true;
        }

        return result;
    }

    /**
     * Sets the meta-information on the comic based on the comic's filename.
     *
     * @param comic
     *            the comic to be updated
     */
    public void execute(Comic comic)
    {
        String filename = FilenameUtils.getName(comic.getFilename());
        this.logger.debug("Attempting to extract comic meta-data from filename: {}", filename);

        boolean done = false;
        for (int index = 0;
             !done && (index < RULESET.length);
             index++)
        {
            this.logger.debug("Attempting to use ruleset #{}", index);
            done = (this.applyRule(comic, filename, RULESET[index]));
        }
    }
}