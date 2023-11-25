// HACK to make vitest work with ESLint rule tester
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// eslint-disable-next-line import/no-namespace
import * as vitest from "vitest";
import { RuleTester } from "eslint";

RuleTester.afterAll = vitest.afterAll;
RuleTester.describe = vitest.describe;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
