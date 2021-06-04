package org.comixedproject.task.runner;

import static junit.framework.TestCase.*;
import static org.comixedproject.task.runner.TaskManager.*;
import static org.junit.Assert.assertNotEquals;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import org.comixedproject.model.tasks.PersistedTask;
import org.comixedproject.model.tasks.PersistedTaskType;
import org.comixedproject.model.tasks.TaskAuditLogEntry;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.Task;
import org.comixedproject.task.TaskException;
import org.comixedproject.views.View;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@RunWith(MockitoJUnitRunner.class)
public class TaskManagerTest {
  private static final Date TEST_STARTED = new Date();
  private static final PersistedTaskType TEST_TASK_TYPE = PersistedTaskType.ADD_COMIC;
  private static final String TEST_TASK_AS_JSON = "Task encoded as JSON";
  private static final Long TEST_TASK_ID = 717L;

  @InjectMocks private TaskManager manager;
  @Mock private ThreadPoolTaskExecutor taskExecutor;
  @Mock private TaskService taskService;
  @Mock private Task task;
  @Mock private PersistedTask persistedTask;
  @Mock private ObjectMapper objectMapper;
  @Mock private ObjectWriter objectWriter;

  @Captor ArgumentCaptor<TaskAuditLogEntry> taskAuditLogEntryArgumentCaptor;
  @Captor ArgumentCaptor<Runnable> runnableArgumentCaptor;

  private Map<Long, PersistedTaskType> runningTaskList = new HashMap<>();

  @Before
  public void setUp() {
    Mockito.when(objectMapper.writerWithView(Mockito.any())).thenReturn(objectWriter);

    Mockito.when(persistedTask.getId()).thenReturn(TEST_TASK_ID);
    Mockito.when(task.getTaskType()).thenReturn(TEST_TASK_TYPE);

    Mockito.when(taskService.getRunningTasks()).thenReturn(runningTaskList);
  }

  @Test
  public void testAfterPropertiesSet() {
    manager.afterPropertiesSet();

    Mockito.verify(taskExecutor, Mockito.times(1)).setThreadNamePrefix(TASK_EXECUTOR_PREFIX);
    Mockito.verify(taskExecutor, Mockito.times(1)).setCorePoolSize(CORE_POOL_SIZE);
    Mockito.verify(taskExecutor, Mockito.times(1)).setMaxPoolSize(MAX_POOL_SIZE);
    Mockito.verify(taskExecutor, Mockito.times(1)).setWaitForTasksToCompleteOnShutdown(false);
  }

  @Test
  public void testExecuteAlreadyRunning() throws TaskException {
    runningTaskList.put(TEST_TASK_ID, TEST_TASK_TYPE);

    manager.runTask(task, persistedTask);

    Mockito.verify(task, Mockito.never()).startTask();
  }

  @Test
  public void testExecuteNoPersistedTask() throws TaskException {
    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());

    manager.runTask(task);

    final Runnable runnable = runnableArgumentCaptor.getValue();

    runnable.run();

    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnable);
    Mockito.verify(task, Mockito.times(1)).startTask();
  }

  @Test
  public void testExecuteWithTaskFailure() throws JsonProcessingException, TaskException {
    runningTaskList.clear();

    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());
    Mockito.doThrow(TaskException.class).when(task).startTask();
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_TASK_AS_JSON);
    Mockito.doNothing()
        .when(taskService)
        .saveAuditLogEntry(taskAuditLogEntryArgumentCaptor.capture());

    manager.runTask(task, persistedTask);

    // run the task
    final Runnable runnable = runnableArgumentCaptor.getValue();
    runnable.run();

    final TaskAuditLogEntry entry = taskAuditLogEntryArgumentCaptor.getValue();

    assertNotNull(entry);
    assertNotNull(entry.getStartTime());
    assertTrue(entry.getEndTime().getTime() > TEST_STARTED.getTime());
    assertEquals(TEST_TASK_AS_JSON, entry.getDescription());
    assertNotNull(entry.getException());

    Mockito.verify(task, Mockito.times(1)).startTask();
    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnableArgumentCaptor.getValue());
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.AuditLogEntryDetail.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(task);
    Mockito.verify(taskService, Mockito.times(1))
        .saveAuditLogEntry(taskAuditLogEntryArgumentCaptor.getValue());
  }

  @Test
  public void testExecute() throws JsonProcessingException, TaskException {
    runningTaskList.clear();

    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());
    Mockito.when(objectWriter.writeValueAsString(Mockito.any())).thenReturn(TEST_TASK_AS_JSON);
    Mockito.doNothing()
        .when(taskService)
        .saveAuditLogEntry(taskAuditLogEntryArgumentCaptor.capture());

    manager.runTask(task, persistedTask);

    // run the task
    final Runnable runnable = runnableArgumentCaptor.getValue();
    runnable.run();

    final TaskAuditLogEntry entry = taskAuditLogEntryArgumentCaptor.getValue();

    assertNotNull(entry);
    assertNotNull(entry.getStartTime());
    assertTrue(entry.getEndTime().getTime() > TEST_STARTED.getTime());
    assertEquals(TEST_TASK_AS_JSON, entry.getDescription());
    assertNull(entry.getException());

    Mockito.verify(task, Mockito.times(1)).startTask();
    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnableArgumentCaptor.getValue());
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.AuditLogEntryDetail.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(task);
    Mockito.verify(taskService, Mockito.times(1))
        .saveAuditLogEntry(taskAuditLogEntryArgumentCaptor.getValue());
    Mockito.verify(taskService, Mockito.times(1)).delete(persistedTask);
  }

  @Test
  public void testExecuteJsonProcessingException() throws JsonProcessingException, TaskException {
    runningTaskList.clear();

    Mockito.doNothing().when(taskExecutor).execute(runnableArgumentCaptor.capture());
    Mockito.when(objectWriter.writeValueAsString(Mockito.any()))
        .thenThrow(JsonProcessingException.class);
    Mockito.doNothing()
        .when(taskService)
        .saveAuditLogEntry(taskAuditLogEntryArgumentCaptor.capture());

    manager.runTask(task, persistedTask);

    // run the task
    final Runnable runnable = runnableArgumentCaptor.getValue();
    runnable.run();

    final TaskAuditLogEntry entry = taskAuditLogEntryArgumentCaptor.getValue();

    assertNotNull(entry);
    assertNotNull(entry.getStartTime());
    assertTrue(entry.getEndTime().getTime() > TEST_STARTED.getTime());
    assertNotNull(entry.getDescription());
    assertNotEquals(TEST_TASK_AS_JSON, entry.getDescription());
    assertNull(entry.getException());

    Mockito.verify(task, Mockito.times(1)).startTask();
    Mockito.verify(taskExecutor, Mockito.times(1)).execute(runnableArgumentCaptor.getValue());
    Mockito.verify(objectMapper, Mockito.times(1)).writerWithView(View.AuditLogEntryDetail.class);
    Mockito.verify(objectWriter, Mockito.times(1)).writeValueAsString(task);
    Mockito.verify(taskService, Mockito.times(1))
        .saveAuditLogEntry(taskAuditLogEntryArgumentCaptor.getValue());
  }
}
