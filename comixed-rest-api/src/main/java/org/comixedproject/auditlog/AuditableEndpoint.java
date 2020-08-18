package org.comixedproject.auditlog;

/**
 * <code>AuditableEndpoint</code> is used to indicate that a method is to be audited whenever it's
 * invoked. The method <b>must</b> return a {@link ApiResponse} object.
 *
 * @author Darryl L. Pierce
 */
public @interface AuditableEndpoint {}
