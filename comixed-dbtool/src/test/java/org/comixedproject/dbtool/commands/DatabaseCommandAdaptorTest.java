/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.dbtool.commands;

import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertSame;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.FatalBeanException;
import org.springframework.context.ApplicationContext;

@RunWith(MockitoJUnitRunner.class)
public class DatabaseCommandAdaptorTest {
  private static final String TEST_COMMAND_NAME = "test-command";
  private static final String TEST_BEAN_NAME = "testDatabaseCommand";

  @InjectMocks private DatabaseCommandAdaptor adaptor;
  @Mock private ApplicationContext applicationContext;
  @Mock private DatabaseCommand command;

  @Before
  public void setUp() {
    adaptor
        .getCommands()
        .add(new DatabaseCommandAdaptor.DatabaseCommandEntry(TEST_COMMAND_NAME, TEST_BEAN_NAME));
    Mockito.when(applicationContext.getBean(Mockito.anyString(), Mockito.any(Class.class)))
        .thenReturn(command);
  }

  @Test(expected = DatabaseCommandException.class)
  public void testGetCommandForUnknownName() throws DatabaseCommandException {
    adaptor.getCommand(TEST_COMMAND_NAME.substring(1));
  }

  @Test(expected = DatabaseCommandException.class)
  public void testGetCommandNoSuchBean() throws DatabaseCommandException {
    Mockito.when(applicationContext.getBean(TEST_BEAN_NAME, DatabaseCommand.class))
        .thenThrow(FatalBeanException.class);

    try {
      adaptor.getCommand(TEST_COMMAND_NAME);
    } finally {
      Mockito.verify(applicationContext, Mockito.times(1))
          .getBean(TEST_BEAN_NAME, DatabaseCommand.class);
    }
  }

  @Test
  public void testGetCommand() throws DatabaseCommandException {
    final DatabaseCommand result = adaptor.getCommand(TEST_COMMAND_NAME);

    assertNotNull(result);
    assertSame(command, result);

    Mockito.verify(applicationContext, Mockito.times(1))
        .getBean(TEST_BEAN_NAME, DatabaseCommand.class);
  }
}
