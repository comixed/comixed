/*
 * ComixEd - A digital comic book library management application.
 * Copyright (C) 2017, Darryl L. Pierce
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

package org.comixed.web;

import java.io.InputStream;

/**
 * <code>WebResponseHandler</code> defines a type that receives the response
 * from a {@link WebRequest} and responds appropriately to the content.
 * 
 * @author Darryl L. Pierce
 *
 */
public interface WebResponseHandler
{
    /**
     * Receives the content of a web request.
     * 
     * @param input
     *            the content source stream
     */
    void processContent(InputStream input);
}
