package com.vaarta.auth.model;

/**
 * Application roles.
 * The role column is stored as a plain VARCHAR in the database for simplicity
 * and to avoid EnumType.STRING vs ORDINAL confusion.
 */
public enum Role {
    USER,
    ADMIN
}
