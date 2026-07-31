type Primitive = string | number | boolean;

/**
 * Client-side equivalent of Liquid `| t:`: replaces `{{ key }}`
 * placeholders in a translated string (often provided via a `<template>`).
 */
export function t(template: string, vars: Record<string, Primitive>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}
