import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, useMatches, useActionData, useLoaderData, useParams, NavLink, data, Meta, Links, ScrollRestoration, Scripts, Outlet, Link, useOutletContext, useNavigation, Form, useNavigate, href, redirect } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createElement, useEffect } from "react";
import { getToast, dataWithSuccess } from "remix-toast";
import { Toaster as Toaster$1, toast } from "sonner";
import { match } from "ts-pattern";
import { useTheme } from "next-themes";
import { twc, createTwc } from "react-twc";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CircleIcon, ArrowLeftIcon, LoaderCircleIcon } from "lucide-react";
import path, { basename as basename$1 } from "node:path";
import { z } from "zod";
import { zx } from "zodix";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PrismaClient } from "@prisma/client";
import createDebug from "debug";
import { useForm, getFormProps, getTextareaProps, getInputProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import * as LabelPrimitive from "@radix-ui/react-label";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { google } from "@ai-sdk/google";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateText } from "ai";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
import weekday from "dayjs/plugin/weekday.js";
import { fromAsyncThrowable, okAsync } from "neverthrow";
import fg from "fast-glob";
import fs from "node:fs/promises";
import crypto from "node:crypto";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function withComponentProps(Component) {
  return function Wrapped() {
    const props = {
      params: useParams(),
      loaderData: useLoaderData(),
      actionData: useActionData(),
      matches: useMatches()
    };
    return createElement(Component, props);
  };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn("flex flex-col gap-1.5 px-6", className),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-semibold", className),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function CardFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-footer",
      className: cn("flex items-center px-6", className),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    LabelPrimitive.Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
const NavTabs = twc.div`-mb-px flex gap-2`;
const NavTab = twc(NavLink)`
border-transparent text-muted-foreground
hover:border-foreground/70 hover:text-foreground/70
whitespace-nowrap border-b-2 px-1 text-sm font-medium
aria-[current]:border-primary
aria-[current]:text-primary
`;
function RadioGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Root,
    {
      "data-slot": "radio-group",
      className: cn("grid gap-3", className),
      ...props
    }
  );
}
function RadioGroupItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Item,
    {
      "data-slot": "radio-group-item",
      className: cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        RadioGroupPrimitive.Indicator,
        {
          "data-slot": "radio-group-indicator",
          className: "relative flex items-center justify-center",
          children: /* @__PURE__ */ jsx(CircleIcon, { className: "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" })
        }
      )
    }
  );
}
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium"
        }
      },
      ...props
    }
  );
};
const twx = createTwc({ compose: cn });
const Stack = twx.div`flex flex-col gap-2`;
const HStack = twx.div`flex gap-2 items-center`;
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "text-muted-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      ),
      ...props
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
const globalStyles = "/assets/globals-CU3Dam8W.css";
const links = () => [{
  rel: "stylesheet",
  href: globalStyles
}];
const loader$3 = async ({
  request
}) => {
  const {
    toast: toast2,
    headers
  } = await getToast(request);
  return data({
    toastData: toast2
  }, {
    headers
  });
};
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = withComponentProps(function App() {
  const {
    toastData
  } = useLoaderData();
  useEffect(() => {
    if (!toastData) return;
    const toastFn = match(toastData.type).with("info", () => toast.info).with("warning", () => toast.warning).with("error", () => toast.error).with("success", () => toast.success).exhaustive();
    toastFn(toastData.message, {
      description: toastData.description,
      position: "bottom-right"
    });
  }, [toastData]);
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Toaster, {
      closeButton: true,
      richColors: true
    }), /* @__PURE__ */ jsx(Outlet, {})]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root,
  links,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const meta$3 = () => {
  return [{
    title: "New Remix App"
  }, {
    name: "description",
    content: "Welcome to Remix!"
  }];
};
const _layout = withComponentProps(function LayoutPage() {
  return /* @__PURE__ */ jsxs("div", {
    className: "grid min-h-screen grid-cols-1 grid-rows-[auto_1fr] gap-2",
    children: [/* @__PURE__ */ jsx("header", {
      className: "bg-card px-4 py-2 shadow-sm",
      children: /* @__PURE__ */ jsx("h1", {
        className: "text-xl font-bold",
        children: /* @__PURE__ */ jsx(Link, {
          to: "/",
          children: "OSS Translation"
        })
      })
    }), /* @__PURE__ */ jsx("main", {
      children: /* @__PURE__ */ jsx(Outlet, {})
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _layout,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const debug = createDebug("app:db");
const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }]
});
prisma.$on("query", (e) => {
  debug(`${e.query}, ${e.params}, ${e.duration}ms`);
});
const getProject$1 = async (projectId) => {
  return await prisma.project.findUniqueOrThrow({
    where: {
      id: projectId
    }
  });
};
const getFile$1 = async (projectId, fileId) => {
  return await prisma.file.findUniqueOrThrow({
    where: {
      id: fileId,
      projectId
    }
  });
};
const meta$2 = ({
  data: data2
}) => [{
  title: `${data2 == null ? void 0 : data2.filename} - ${data2 == null ? void 0 : data2.project.id}`
}];
const loader$2 = async ({
  params
}) => {
  const {
    project: projectId,
    file: fileId
  } = zx.parseParams(params, {
    project: z.string(),
    file: zx.NumAsString
  });
  const project = await getProject$1(projectId);
  const file = await getFile$1(projectId, fileId);
  return {
    project,
    file,
    filename: basename$1(file.path)
  };
};
const route$6 = withComponentProps(function ProjectFileDetails({
  loaderData: {
    project,
    file
  }
}) {
  return /* @__PURE__ */ jsxs(Card, {
    children: [/* @__PURE__ */ jsxs(CardHeader, {
      children: [/* @__PURE__ */ jsxs(CardTitle, {
        children: [/* @__PURE__ */ jsx(Button, {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "mr-2 rounded-full",
          asChild: true,
          children: /* @__PURE__ */ jsx(Link, {
            to: "..",
            relative: "path",
            children: /* @__PURE__ */ jsx(ArrowLeftIcon, {
              size: "16"
            })
          })
        }), file.path, " ", /* @__PURE__ */ jsx(Badge, {
          variant: "outline",
          children: "File"
        })]
      }), /* @__PURE__ */ jsxs(NavTabs, {
        children: [/* @__PURE__ */ jsx(NavTab, {
          to: ".",
          end: true,
          children: "Edit"
        }), /* @__PURE__ */ jsx(NavTab, {
          to: "./translate",
          end: true,
          children: "Translate"
        }), /* @__PURE__ */ jsx(NavTab, {
          to: "./chunks",
          end: true,
          children: "Chunks"
        })]
      })]
    }), /* @__PURE__ */ jsx(CardContent, {
      children: /* @__PURE__ */ jsx(Outlet, {
        context: {
          project,
          file
        }
      })
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$6,
  loader: loader$2,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const updateFileOutput$1 = async (projectId, fileId, output) => {
  return await prisma.file.update({
    data: {
      output,
      isUpdated: false
    },
    where: {
      id: fileId,
      projectId
    }
  });
};
const schema$2 = z.object({
  output: z.string()
});
const action$3 = async ({
  request,
  params
}) => {
  const {
    project: projectId,
    file: fileId
  } = zx.parseParams(params, {
    project: z.string(),
    file: zx.NumAsString
  });
  const submission = parseWithZod(await request.formData(), {
    schema: schema$2
  });
  if (submission.status !== "success") {
    return {
      lastResult: submission.reply()
    };
  }
  await updateFileOutput$1(projectId, fileId, submission.value.output);
  return {
    lastResult: submission.reply({
      resetForm: true
    })
  };
};
const route$5 = withComponentProps(function ProjectFileDetails2({
  actionData
}) {
  const {
    file
  } = useOutletContext();
  const navigation = useNavigation();
  const [form, {
    output
  }] = useForm({
    lastResult: navigation.state === "idle" ? actionData == null ? void 0 : actionData.lastResult : null,
    defaultValue: {
      output: file.output
    },
    onValidate: ({
      formData
    }) => parseWithZod(formData, {
      schema: schema$2
    })
  });
  return /* @__PURE__ */ jsx("div", {
    children: /* @__PURE__ */ jsxs(Form, {
      method: "POST",
      ...getFormProps(form),
      className: "grid grid-cols-2 gap-2",
      children: [/* @__PURE__ */ jsxs(Stack, {
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: "original",
          children: "Original"
        }), /* @__PURE__ */ jsx(Textarea, {
          id: "original",
          readOnly: true,
          rows: 20,
          value: file.content
        })]
      }), /* @__PURE__ */ jsxs(Stack, {
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: output.id,
          children: "Output"
        }), /* @__PURE__ */ jsx(Textarea, {
          ...getTextareaProps(output),
          rows: 20
        }), /* @__PURE__ */ jsx("div", {
          id: output.errorId,
          className: "text-destructive text-sm",
          children: output.errors
        }), /* @__PURE__ */ jsxs(HStack, {
          children: [/* @__PURE__ */ jsx(Button, {
            variant: "secondary",
            ...form.reset.getButtonProps(),
            disabled: !form.dirty,
            className: "w-full",
            children: "Reset"
          }), /* @__PURE__ */ jsx(Button, {
            type: "submit",
            disabled: !form.dirty,
            className: "w-full",
            children: "Save"
          })]
        })]
      })]
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: route$5
}, Symbol.toStringTag, { value: "Module" }));
const processor = remark().use(remarkParse).use(remarkFrontmatter).use(remarkStringify, { tightDefinitions: true });
const splitMarkdownByHeaders = (markdownText) => {
  const ast = processor.parse(markdownText);
  const chunks = [];
  let currentChunk = "";
  for (const node of ast.children) {
    if (node.type === "heading") {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = processor.stringify(node);
    } else {
      currentChunk += `
${// biome-ignore lint/suspicious/noExplicitAny: <explanation>
      processor.stringify(node)}`;
    }
  }
  if (currentChunk) {
    chunks.push(`${currentChunk.trim()}
`);
  }
  return chunks;
};
const route$4 = withComponentProps(function TestPage() {
  const {
    file
  } = useOutletContext();
  const chunks = splitMarkdownByHeaders(file.content);
  return /* @__PURE__ */ jsxs("div", {
    className: "grid grid-cols-2 grid-rows-1 gap-2",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "grid grid-cols-1 grid-rows-[auto_1fr] gap-2",
      children: [/* @__PURE__ */ jsx(Label, {
        htmlFor: "original",
        children: "Original"
      }), /* @__PURE__ */ jsx(Textarea, {
        id: "original",
        className: "block rounded border",
        defaultValue: file.content
      })]
    }), /* @__PURE__ */ jsx("div", {
      className: "grid grid-cols-1 gap-4",
      children: chunks.map((chunk, index) => /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "mb-0.5 flex text-sm",
          children: [/* @__PURE__ */ jsxs("span", {
            children: [index + 1, ". "]
          }), /* @__PURE__ */ jsx("span", {
            className: "flex-1"
          }), /* @__PURE__ */ jsxs("span", {
            className: "text-muted-foreground text-sm",
            children: [chunk.length.toLocaleString(), " characters"]
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "rounded border bg-slate-50 px-3 py-2 text-sm break-words whitespace-pre-wrap",
          children: chunk
        })]
      }, `${index}_${chunk}`))
    })]
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$4
}, Symbol.toStringTag, { value: "Module" }));
const countTokens = async (text, model) => {
  const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? ""
  );
  const genModel = genAI.getGenerativeModel({ model });
  const result = await genModel.countTokens(text);
  return result.totalTokens;
};
const MAX_TOKENS = 8192;
const translateByGemini = async ({
  systemPrompt,
  source
}) => {
  const tokens = await countTokens(source, "gemini-2.0-flash-exp");
  const sections = tokens > MAX_TOKENS ? splitMarkdownByHeaders(source) : [source];
  let finalDestinationText = "";
  try {
    for (const section of sections) {
      const ret = await generateText({
        model: google("gemini-2.0-flash-exp"),
        system: systemPrompt,
        prompt: section,
        experimental_continueSteps: true
      });
      finalDestinationText += `${ret.text}
`;
    }
    return {
      type: "success",
      destinationText: finalDestinationText
    };
  } catch (e) {
    console.log(e);
    let errorMessage = "";
    if (e instanceof Error) {
      errorMessage = `${e.name}: ${e.message}, ${e.stack}`;
    } else {
      errorMessage = String(e);
    }
    return { type: "error", error: errorMessage };
  }
};
const updateFileOutput = async (projectId, fileId, output) => {
  return await prisma.file.update({
    data: {
      output,
      isUpdated: false,
      translatedAt: /* @__PURE__ */ new Date()
    },
    where: {
      id: fileId,
      projectId
    }
  });
};
const getFile = async (projectId, fileId) => {
  return await prisma.file.findUniqueOrThrow({
    where: {
      id: fileId,
      projectId
    }
  });
};
const schema$1 = z.object({
  prompt: z.string()
});
const action$2 = async ({
  request,
  params
}) => {
  const {
    project: projectId,
    file: fileId
  } = zx.parseParams(params, {
    project: z.string(),
    file: zx.NumAsString
  });
  const submission = parseWithZod(await request.formData(), {
    schema: schema$1
  });
  if (submission.status !== "success") {
    return data({
      lastResult: submission.reply()
    });
  }
  const file = await getFile(projectId, fileId);
  const ret = await translateByGemini({
    systemPrompt: submission.value.prompt,
    source: file.content
  });
  if (ret.type === "error") {
    return {
      lastResult: submission.reply({
        resetForm: true,
        formErrors: [ret.error]
      })
    };
  }
  await updateFileOutput(projectId, fileId, ret.destinationText);
  return dataWithSuccess({
    lastResult: submission.reply({
      resetForm: true
    })
  }, {
    message: "Translation successful"
  });
};
const route$3 = withComponentProps(function ProjectFileDetails3({
  actionData
}) {
  const {
    project,
    file
  } = useOutletContext();
  const navigation = useNavigation();
  const [form, {
    prompt
  }] = useForm({
    lastResult: navigation.state === "idle" ? actionData == null ? void 0 : actionData.lastResult : null,
    defaultValue: {
      prompt: project.prompt
    },
    onValidate: ({
      formData
    }) => parseWithZod(formData, {
      schema: schema$1
    })
  });
  return /* @__PURE__ */ jsx("div", {
    children: /* @__PURE__ */ jsxs(Form, {
      method: "POST",
      ...getFormProps(form),
      className: "grid grid-cols-2 gap-2",
      children: [/* @__PURE__ */ jsxs(Stack, {
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: "original",
          children: "Original"
        }), /* @__PURE__ */ jsx(Textarea, {
          id: "original",
          readOnly: true,
          rows: 15,
          value: file.content
        })]
      }), /* @__PURE__ */ jsxs(Stack, {
        children: [/* @__PURE__ */ jsx(Label, {
          htmlFor: "output",
          children: "Output"
        }), /* @__PURE__ */ jsx(Textarea, {
          id: "output",
          readOnly: true,
          value: file.output ?? void 0,
          rows: 15
        })]
      }), /* @__PURE__ */ jsxs(Stack, {
        className: "col-span-2",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx(Label, {
            children: "Prompt"
          }), /* @__PURE__ */ jsx(Textarea, {
            ...getTextareaProps(prompt)
          })]
        }), /* @__PURE__ */ jsxs(Button, {
          type: "submit",
          className: "w-full",
          disabled: navigation.state === "submitting",
          children: [navigation.state === "submitting" && /* @__PURE__ */ jsx(LoaderCircleIcon, {
            size: "16",
            className: "mr-2 animate-spin"
          }), "Translate"]
        })]
      })]
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: route$3
}, Symbol.toStringTag, { value: "Module" }));
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(weekday);
const exportFiles = async (projectId) => {
  var _a;
  const exportedFiles = [];
  const files = await prisma.file.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" }
  });
  await fs.rm(path.join(process.cwd(), "exports", "projects", projectId), {
    recursive: true,
    force: true
  });
  for (const file of files) {
    if (!file.output) {
      continue;
    }
    const outputPath = path.join(process.cwd(), "exports", file.path);
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, file.output, { encoding: "utf-8" });
    console.log(`Exported ${file.path}: ${(_a = file.output) == null ? void 0 : _a.length} bytes`);
    exportedFiles.push(file.path);
  }
  return exportedFiles;
};
const getProject = async (projectId) => {
  const project = await prisma.project.findFirstOrThrow({
    where: { id: projectId }
  });
  return {
    ...project,
    excludes: JSON.parse(project.excludes)
  };
};
const getProjectDetails = async (projectId) => {
  return await prisma.project.findFirstOrThrow({
    include: {
      files: {
        select: {
          id: true,
          path: true,
          content: true,
          contentMD5: true,
          output: true,
          isUpdated: true,
          translatedAt: true,
          updatedAt: true,
          createdAt: true
        },
        orderBy: [{ isUpdated: "desc" }, { updatedAt: "desc" }]
      }
    },
    where: { id: projectId }
  });
};
const listProjectFiles = async (projectId) => {
  return await prisma.file.findMany({
    where: { projectId },
    orderBy: { path: "asc" }
  });
};
const md5sum = (content) => {
  const hash = crypto.createHash("md5");
  return hash.update(content).digest("hex");
};
const fileContentImpl = async (directory, filename) => {
  const content = await fs.readFile(path.join(directory, filename), "utf-8");
  const md5 = md5sum(content);
  return { filename: path.join(directory, filename), content, md5 };
};
const getRepositoryFileContent = (directory, filename) => {
  return fromAsyncThrowable(
    () => fileContentImpl(directory, filename),
    (err) => err
  )();
};
const listRepositoryFiles = async (directory, opt = {
  pattern: "**/*",
  excludes: []
}) => {
  const filenames = await fg(
    [opt.pattern, ...opt.excludes.map((e) => `!${e}`)],
    {
      cwd: directory,
      onlyFiles: true
    }
  );
  const files = [];
  for (const filename of filenames) {
    const result = await getRepositoryFileContent(directory, filename);
    if (result.isOk()) {
      files.push(result.value);
    }
  }
  return okAsync(files);
};
const getProjectPath = (project) => {
  return path.join("projects", project.id, project.path);
};
const rescanFiles = async (projectId) => {
  const project = await getProject(projectId);
  const projectFiles = await listProjectFiles(projectId);
  const directory = getProjectPath(project);
  const repositoryFiles = await listRepositoryFiles(directory, {
    pattern: project.pattern,
    excludes: project.excludes
  });
  if (repositoryFiles.isErr()) {
    return repositoryFiles;
  }
  const updatedFiles = [];
  for (const repositoryFile of repositoryFiles.value) {
    const matchFile = projectFiles.find((projectFile) => {
      return projectFile.path === repositoryFile.filename;
    });
    if (matchFile && matchFile.contentMD5 !== repositoryFile.md5) {
      updatedFiles.push({
        filePath: repositoryFile.filename,
        content: repositoryFile.content,
        contentMD5: repositoryFile.md5,
        status: "updated"
      });
    }
    if (!matchFile) {
      updatedFiles.push({
        filePath: repositoryFile.filename,
        content: repositoryFile.content,
        contentMD5: repositoryFile.md5,
        status: "added"
      });
    }
  }
  for (const projectFile of projectFiles) {
    const matchFile = repositoryFiles.value.find((repositoryFile) => {
      return projectFile.path === repositoryFile.filename;
    });
    if (!matchFile) {
      updatedFiles.push({
        filePath: projectFile.path,
        content: projectFile.content,
        contentMD5: projectFile.contentMD5,
        status: "removed"
      });
    }
  }
  for (const updatedFile of updatedFiles) {
    if (updatedFile.status === "updated") {
      await prisma.file.updateMany({
        data: {
          content: updatedFile.content,
          contentMD5: updatedFile.contentMD5,
          isUpdated: true
        },
        where: { path: updatedFile.filePath }
      });
    }
    if (updatedFile.status === "added") {
      await prisma.file.create({
        data: {
          path: updatedFile.filePath,
          content: updatedFile.content,
          contentMD5: updatedFile.contentMD5,
          isUpdated: true,
          projectId: project.id
        }
      });
    }
    if (updatedFile.status === "removed") {
      await prisma.file.deleteMany({
        where: { path: updatedFile.filePath }
      });
    }
  }
  return okAsync(updatedFiles);
};
const startTranslationJob = async (projectId) => {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId }
  });
  const files = await prisma.file.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" }
  });
  const job = await prisma.translationJob.create({
    data: {
      projectId,
      fileCount: files.length,
      promptTokens: 0,
      outputTokens: 0,
      translatedCount: 0,
      status: "pending"
    }
  });
  for (const file of files) {
    if (!file.isUpdated) {
      continue;
    }
    console.log(`translation task started: ${file.path}`);
    const task = await prisma.translationTask.create({
      data: {
        jobId: job.id,
        input: file.content,
        output: "",
        prompt: project.prompt,
        promptTokens: 0,
        outputTokens: 0,
        generated: "",
        status: "pending"
      }
    });
    const ret = await translateByGemini({
      systemPrompt: project.prompt,
      source: file.content
    });
    console.log(file.path, ret.type);
    if (ret.type === "success") {
      const updated = await prisma.file.update({
        where: { id: file.id },
        data: {
          isUpdated: false,
          output: ret.destinationText,
          translatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      console.log(`file updated: ${updated.path}`);
      await prisma.translationTask.update({
        where: { id: task.id },
        data: {
          output: ret.destinationText,
          status: "done"
        }
      });
    } else {
      await prisma.translationTask.update({
        where: { id: task.id },
        data: {
          output: ret.error,
          status: "error"
        }
      });
    }
  }
  console.log("translation job finished: ", job.id);
  return job;
};
const meta$1 = ({
  data: data2
}) => [{
  title: `${data2 == null ? void 0 : data2.project.id}`
}];
const loader$1 = async ({
  params
}) => {
  const {
    project: projectId
  } = zx.parseParams(params, {
    project: z.string()
  });
  const project = await getProjectDetails(projectId);
  return {
    project
  };
};
const action$1 = async ({
  request,
  params
}) => {
  const {
    project: projectId
  } = zx.parseParams(params, {
    project: z.string()
  });
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "rescan-project") {
    const updatedFiles = await rescanFiles(projectId);
    if (updatedFiles.isErr()) {
      throw new Error(updatedFiles.error);
    }
    console.log({
      updated: updatedFiles.value.filter((file) => file.status === "updated").map((file) => file.filePath),
      added: updatedFiles.value.filter((file) => file.status === "added").map((file) => file.filePath),
      removed: updatedFiles.value.filter((file) => file.status === "removed").map((file) => file.filePath)
    });
    return {
      intent: "rescan-project",
      rescan_result: updatedFiles.value
    };
  }
  if (intent === "start-translation-job") {
    return {
      intent: "start-translation-job",
      translation_result: await startTranslationJob(projectId)
    };
  }
  if (intent === "export-files") {
    return {
      intent: "export-files",
      export_result: await exportFiles(projectId)
    };
  }
  return {
    intent: "unknown"
  };
};
const route$2 = withComponentProps(function ProjectDetail({
  loaderData: {
    project
  },
  actionData
}) {
  var _a, _b, _c;
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";
  const isRescanInProgress = navigation.state === "submitting" && ((_a = navigation.formData) == null ? void 0 : _a.get("intent")) === "rescan-project";
  const isTranslationInProgress = navigation.state === "submitting" && ((_b = navigation.formData) == null ? void 0 : _b.get("intent")) === "start-translation-job";
  const isExportInProgress = navigation.state === "submitting" && ((_c = navigation.formData) == null ? void 0 : _c.get("intent")) === "export-files";
  return /* @__PURE__ */ jsxs(Card, {
    children: [/* @__PURE__ */ jsxs(CardHeader, {
      children: [/* @__PURE__ */ jsxs(CardTitle, {
        children: [/* @__PURE__ */ jsx(Button, {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "mr-2 rounded-full",
          asChild: true,
          children: /* @__PURE__ */ jsx(Link, {
            to: "..",
            relative: "path",
            children: /* @__PURE__ */ jsx(ArrowLeftIcon, {
              size: "16"
            })
          })
        }), project.id, " ", /* @__PURE__ */ jsx(Badge, {
          variant: "outline",
          children: "Project"
        })]
      }), /* @__PURE__ */ jsx(CardDescription, {
        children: project.description
      }), /* @__PURE__ */ jsx(Form, {
        method: "POST",
        children: /* @__PURE__ */ jsxs(HStack, {
          children: [/* @__PURE__ */ jsxs(Button, {
            name: "intent",
            value: "rescan-project",
            disabled: isRescanInProgress,
            children: [isRescanInProgress && /* @__PURE__ */ jsx(LoaderCircleIcon, {
              size: "16",
              className: "mr-2 animate-spin"
            }), "Rescan files"]
          }), /* @__PURE__ */ jsxs(Button, {
            name: "intent",
            value: "start-translation-job",
            disabled: isSubmitting,
            children: [isTranslationInProgress && /* @__PURE__ */ jsx(LoaderCircleIcon, {
              size: "16",
              className: "mr-2 animate-spin"
            }), "Start Translation"]
          }), /* @__PURE__ */ jsxs(Button, {
            name: "intent",
            value: "export-files",
            disabled: isSubmitting,
            children: [isExportInProgress && /* @__PURE__ */ jsx(LoaderCircleIcon, {
              size: "16",
              className: "mr-2 animate-spin"
            }), "Export files"]
          }), /* @__PURE__ */ jsx("div", {
            className: "flex-1"
          }), /* @__PURE__ */ jsxs(HStack, {
            children: [/* @__PURE__ */ jsx("div", {
              children: "Sort by"
            }), /* @__PURE__ */ jsxs(RadioGroup, {
              children: [/* @__PURE__ */ jsxs(HStack, {
                children: [/* @__PURE__ */ jsx(RadioGroupItem, {
                  value: "path",
                  id: "sort_path"
                }), /* @__PURE__ */ jsx(Label, {
                  htmlFor: "sort_path",
                  children: "Path"
                })]
              }), /* @__PURE__ */ jsxs(HStack, {
                children: [/* @__PURE__ */ jsx(RadioGroupItem, {
                  value: "content",
                  id: "sort_content"
                }), /* @__PURE__ */ jsx(Label, {
                  htmlFor: "sort_content",
                  children: "Content"
                })]
              })]
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs("div", {
        children: [(actionData == null ? void 0 : actionData.intent) === "rescan-project" && actionData.rescan_result && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("div", {
            children: "Rescan completed"
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("div", {
                children: "Updated"
              }), /* @__PURE__ */ jsx("ul", {
                children: actionData.rescan_result.filter((file) => file.status === "updated").map((file) => /* @__PURE__ */ jsx("li", {
                  className: "ml-4",
                  children: file.filePath
                }, file.filePath))
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("div", {
                children: "Added"
              }), /* @__PURE__ */ jsx("ul", {
                children: actionData.rescan_result.filter((file) => file.status === "added").map((file) => /* @__PURE__ */ jsx("li", {
                  className: "ml-4",
                  children: file.filePath
                }, file.filePath))
              })]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("div", {
                children: "Removed"
              }), /* @__PURE__ */ jsx("ul", {
                children: actionData.rescan_result.filter((file) => file.status === "removed").map((file) => /* @__PURE__ */ jsx("li", {
                  className: "ml-4",
                  children: file.filePath
                }, file.filePath))
              })]
            })]
          })]
        }), (actionData == null ? void 0 : actionData.intent) === "start-translation-job" && actionData.translation_result && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("div", {
            children: "Translation job started"
          }), /* @__PURE__ */ jsxs("div", {
            children: ["Job ID: ", actionData.translation_result.id]
          })]
        }), (actionData == null ? void 0 : actionData.intent) === "export-files" && actionData.export_result && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("div", {
            children: "Export completed"
          }), /* @__PURE__ */ jsx("div", {
            children: /* @__PURE__ */ jsx("ul", {
              children: actionData.export_result.map((file) => /* @__PURE__ */ jsx("li", {
                children: file
              }, file))
            })
          })]
        })]
      })]
    }), /* @__PURE__ */ jsxs(CardContent, {
      children: [project.files.length, "件のファイル", /* @__PURE__ */ jsxs(Table, {
        children: [/* @__PURE__ */ jsx(TableHeader, {
          children: /* @__PURE__ */ jsxs(TableRow, {
            children: [/* @__PURE__ */ jsx(TableHead, {
              children: "Path"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "Content"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "Translated"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "UpdatedAt"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "TranslatedAt"
            }), /* @__PURE__ */ jsx(TableHead, {
              children: "isUpdated"
            })]
          })
        }), /* @__PURE__ */ jsx(TableBody, {
          children: project.files.map((file) => {
            var _a2;
            return /* @__PURE__ */ jsxs(TableRow, {
              className: "hover:cursor-pointer",
              onClick: () => {
                navigate(href("/:project/:file", {
                  project: project.id,
                  file: String(file.id)
                }));
              },
              children: [/* @__PURE__ */ jsx(TableCell, {
                children: file.path
              }), /* @__PURE__ */ jsx(TableCell, {
                children: /* @__PURE__ */ jsx("div", {
                  className: "mr-2 text-right",
                  children: file.content.length.toLocaleString()
                })
              }), /* @__PURE__ */ jsx(TableCell, {
                children: /* @__PURE__ */ jsx("div", {
                  className: "mr-2 text-right",
                  children: (_a2 = file.output) == null ? void 0 : _a2.length.toLocaleString()
                })
              }), /* @__PURE__ */ jsx(TableCell, {
                children: dayjs(file.updatedAt).utc().tz().format("YYYY-MM-DD HH:mm:ss")
              }), /* @__PURE__ */ jsx(TableCell, {
                children: file.translatedAt && dayjs(file.translatedAt).utc().tz().format("YYYY-MM-DD HH:mm:ss")
              }), /* @__PURE__ */ jsx(TableCell, {
                children: file.isUpdated && /* @__PURE__ */ jsx(Badge, {
                  children: "Updated"
                })
              })]
            }, file.path);
          })
        })]
      })]
    })]
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: route$2,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const listProjects = async () => {
  return await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });
};
const meta = () => [{
  title: "Projects"
}];
const loader = async ({
  request
}) => {
  const projects = await listProjects();
  return {
    projects
  };
};
const route$1 = withComponentProps(function Index({
  loaderData: {
    projects
  }
}) {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs(Stack, {
    className: "p-4",
    children: [/* @__PURE__ */ jsxs("div", {
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-xl font-semibold",
        children: "Projects"
      }), /* @__PURE__ */ jsx("p", {
        className: "text-muted-foreground",
        children: "Projects are the top-level container for your workspaces. Create a project to get started."
      })]
    }), /* @__PURE__ */ jsx("div", {
      children: /* @__PURE__ */ jsx("div", {
        className: "rounded-md border",
        children: /* @__PURE__ */ jsxs(Table, {
          children: [/* @__PURE__ */ jsx(TableHeader, {
            children: /* @__PURE__ */ jsxs(TableRow, {
              children: [/* @__PURE__ */ jsx(TableCell, {
                children: "ID"
              }), /* @__PURE__ */ jsx(TableCell, {
                children: "Path"
              }), /* @__PURE__ */ jsx(TableCell, {
                children: "Pattern"
              }), /* @__PURE__ */ jsx(TableCell, {
                children: "Excludes"
              }), /* @__PURE__ */ jsx(TableCell, {
                children: "Created At"
              })]
            })
          }), /* @__PURE__ */ jsxs(TableBody, {
            children: [projects.map((project) => /* @__PURE__ */ jsxs(TableRow, {
              className: "hover:cursor-pointer",
              onClick: () => {
                navigate(href("/:project", {
                  project: project.id
                }));
              },
              children: [/* @__PURE__ */ jsx(TableCell, {
                children: project.id
              }), /* @__PURE__ */ jsx(TableCell, {
                children: project.path
              }), /* @__PURE__ */ jsx(TableCell, {
                children: project.pattern
              }), /* @__PURE__ */ jsx(TableCell, {
                children: project.excludes
              }), /* @__PURE__ */ jsx(TableCell, {
                children: project.createdAt.toString()
              })]
            }, project.id)), projects.length === 0 && /* @__PURE__ */ jsx(TableCell, {
              colSpan: 5,
              className: "text-muted-foreground text-center",
              children: "No projects yet."
            })]
          })]
        })
      })
    }), /* @__PURE__ */ jsx("div", {
      children: /* @__PURE__ */ jsx(Button, {
        type: "button",
        variant: "default",
        asChild: true,
        children: /* @__PURE__ */ jsx(Link, {
          to: href("/new"),
          children: "New"
        })
      })
    })]
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: route$1,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const createProject = async (data2) => {
  const project = await prisma.project.create({
    data: {
      ...data2,
      excludes: data2.excludes ? `[${JSON.stringify(data2.excludes)}]` : "[]"
    }
  });
  return {
    ...project,
    excludes: JSON.parse(project.excludes)
  };
};
const createFiles = async (projectId, files) => {
  for (const file of files) {
    await prisma.file.create({
      data: {
        path: file.filename,
        content: file.content,
        contentMD5: file.md5,
        Project: { connect: { id: projectId } }
      }
    });
  }
};
const schema = z.object({
  id: z.string(),
  path: z.string(),
  pattern: z.string(),
  excludes: z.string().optional(),
  description: z.string().optional(),
  prompt: z.string()
});
const action = async ({
  request
}) => {
  const submission = parseWithZod(await request.formData(), {
    schema
  });
  if (submission.status !== "success") {
    return {
      lastResult: submission.reply()
    };
  }
  const project = await createProject(submission.value);
  const files = await listRepositoryFiles(getProjectPath(project), {
    pattern: project.pattern,
    excludes: project.excludes
  });
  if (files.isErr()) {
    throw files.error;
  }
  await createFiles(project.id, files.value);
  throw redirect(href("/"));
};
const route = withComponentProps(function NewProjectPage({
  actionData
}) {
  const [form, {
    id,
    path: path2,
    pattern,
    excludes,
    description,
    prompt
  }] = useForm({
    lastResult: actionData == null ? void 0 : actionData.lastResult,
    defaultValue: {
      prompt: "Translate the following text to Japanese. Markdowns should be left intact:"
    },
    onValidate: ({
      formData
    }) => parseWithZod(formData, {
      schema
    })
  });
  return /* @__PURE__ */ jsx(Form, {
    method: "post",
    ...getFormProps(form),
    children: /* @__PURE__ */ jsxs(Card, {
      children: [/* @__PURE__ */ jsxs(CardHeader, {
        children: [/* @__PURE__ */ jsx(CardTitle, {
          children: "New Project"
        }), /* @__PURE__ */ jsx(CardDescription, {
          children: "Create a new translation project"
        })]
      }), /* @__PURE__ */ jsx(CardContent, {
        children: /* @__PURE__ */ jsxs(Stack, {
          children: [/* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: id.id,
              children: "Name"
            }), /* @__PURE__ */ jsx(Input, {
              ...getInputProps(id, {
                type: "text"
              })
            }), /* @__PURE__ */ jsx("div", {
              id: id.errorId,
              className: "text-destructive text-sm",
              children: id.errors
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: path2.id,
              children: "Document Path"
            }), /* @__PURE__ */ jsx(Input, {
              ...getInputProps(path2, {
                type: "text"
              })
            }), /* @__PURE__ */ jsx("div", {
              id: path2.errorId,
              className: "text-destructive text-sm",
              children: path2.errors
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: pattern.id,
              children: "Glob Pattern"
            }), /* @__PURE__ */ jsx(Input, {
              ...getInputProps(pattern, {
                type: "text"
              })
            }), /* @__PURE__ */ jsx("div", {
              id: pattern.errorId,
              className: "text-destructive text-sm",
              children: pattern.errors
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: excludes.id,
              children: "Excludes"
            }), /* @__PURE__ */ jsx(Input, {
              ...getInputProps(excludes, {
                type: "text"
              })
            }), /* @__PURE__ */ jsx("div", {
              id: excludes.errorId,
              className: "text-destructive text-sm",
              children: excludes.errors
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: description.id,
              children: "Description"
            }), /* @__PURE__ */ jsx(Textarea, {
              ...getTextareaProps(description)
            }), /* @__PURE__ */ jsx("div", {
              id: description.errorId,
              className: "text-destructive text-sm",
              children: description.errors
            })]
          }), /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx(Label, {
              htmlFor: prompt.id,
              children: "Prompt"
            }), /* @__PURE__ */ jsx(Textarea, {
              ...getTextareaProps(prompt)
            }), /* @__PURE__ */ jsx("div", {
              id: prompt.errorId,
              className: "text-destructive text-sm",
              children: prompt.errors
            })]
          })]
        })
      }), /* @__PURE__ */ jsxs(CardFooter, {
        className: "flex flex-col items-stretch gap-2 sm:flex-row",
        children: [/* @__PURE__ */ jsx(Button, {
          type: "button",
          variant: "ghost",
          asChild: true,
          children: /* @__PURE__ */ jsx(Link, {
            to: href("/"),
            children: "Cancel"
          })
        }), /* @__PURE__ */ jsx(Button, {
          type: "submit",
          children: "Create Project"
        })]
      })]
    })
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: route
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-D-__dj-m.js", "imports": ["/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/index-CtQMAkFv.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-BLkWtQYt.js", "imports": ["/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/index-CtQMAkFv.js", "/assets/with-props-BNhccnEm.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/_layout": { "id": "routes/_app+/_layout", "parentId": "root", "path": void 0, "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_layout-DxyuLXJv.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/$project.$file/route": { "id": "routes/_app+/$project.$file/route", "parentId": "routes/_app+/_layout", "path": ":project/:file", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DU93Zm0y.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/arrow-left-CxkRJp4x.js", "/assets/index-BtQaWpDK.js", "/assets/card-B7W9WftO.js", "/assets/index-C3YNuyiX.js", "/assets/createLucideIcon-DnlBZ-aB.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/$project.$file._index/route": { "id": "routes/_app+/$project.$file._index/route", "parentId": "routes/_app+/$project.$file/route", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-Pidg8rh0.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/parse-Ctvozy-0.js", "/assets/index-BtQaWpDK.js", "/assets/label-BZ-T9J-k.js", "/assets/stack-6Vky8XjY.js", "/assets/textarea-DSqrLufP.js", "/assets/index-C3YNuyiX.js", "/assets/index-CtQMAkFv.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/$project.$file.chunks/route": { "id": "routes/_app+/$project.$file.chunks/route", "parentId": "routes/_app+/$project.$file/route", "path": "chunks", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-DiG3m7Vj.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/label-BZ-T9J-k.js", "/assets/textarea-DSqrLufP.js", "/assets/index-CtQMAkFv.js", "/assets/index-C3YNuyiX.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/$project.$file.translate/route": { "id": "routes/_app+/$project.$file.translate/route", "parentId": "routes/_app+/$project.$file/route", "path": "translate", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-rchvQkEJ.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/parse-Ctvozy-0.js", "/assets/index-BtQaWpDK.js", "/assets/label-BZ-T9J-k.js", "/assets/stack-6Vky8XjY.js", "/assets/textarea-DSqrLufP.js", "/assets/loader-circle-DXhqNPWi.js", "/assets/index-C3YNuyiX.js", "/assets/index-CtQMAkFv.js", "/assets/createLucideIcon-DnlBZ-aB.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/$project._index/route": { "id": "routes/_app+/$project._index/route", "parentId": "routes/_app+/_layout", "path": ":project", "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-rSWeFpHV.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/arrow-left-CxkRJp4x.js", "/assets/index-BtQaWpDK.js", "/assets/card-B7W9WftO.js", "/assets/label-BZ-T9J-k.js", "/assets/index-C3YNuyiX.js", "/assets/createLucideIcon-DnlBZ-aB.js", "/assets/stack-6Vky8XjY.js", "/assets/table-BjLX5qNK.js", "/assets/loader-circle-DXhqNPWi.js", "/assets/index-CtQMAkFv.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/_index/route": { "id": "routes/_app+/_index/route", "parentId": "routes/_app+/_layout", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-BY-0ztpf.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/index-BtQaWpDK.js", "/assets/stack-6Vky8XjY.js", "/assets/table-BjLX5qNK.js", "/assets/index-C3YNuyiX.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 }, "routes/_app+/new/route": { "id": "routes/_app+/new/route", "parentId": "routes/_app+/_layout", "path": "new", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-CbuDfa84.js", "imports": ["/assets/with-props-BNhccnEm.js", "/assets/chunk-K6CSEXPM-C_oZJgzf.js", "/assets/parse-Ctvozy-0.js", "/assets/index-BtQaWpDK.js", "/assets/card-B7W9WftO.js", "/assets/index-C3YNuyiX.js", "/assets/label-BZ-T9J-k.js", "/assets/stack-6Vky8XjY.js", "/assets/textarea-DSqrLufP.js", "/assets/index-CtQMAkFv.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-9517a980.js", "version": "9517a980" };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/_app+/_layout": {
    id: "routes/_app+/_layout",
    parentId: "root",
    path: void 0,
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_app+/$project.$file/route": {
    id: "routes/_app+/$project.$file/route",
    parentId: "routes/_app+/_layout",
    path: ":project/:file",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/_app+/$project.$file._index/route": {
    id: "routes/_app+/$project.$file._index/route",
    parentId: "routes/_app+/$project.$file/route",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  },
  "routes/_app+/$project.$file.chunks/route": {
    id: "routes/_app+/$project.$file.chunks/route",
    parentId: "routes/_app+/$project.$file/route",
    path: "chunks",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/_app+/$project.$file.translate/route": {
    id: "routes/_app+/$project.$file.translate/route",
    parentId: "routes/_app+/$project.$file/route",
    path: "translate",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_app+/$project._index/route": {
    id: "routes/_app+/$project._index/route",
    parentId: "routes/_app+/_layout",
    path: ":project",
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "routes/_app+/_index/route": {
    id: "routes/_app+/_index/route",
    parentId: "routes/_app+/_layout",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route7
  },
  "routes/_app+/new/route": {
    id: "routes/_app+/new/route",
    parentId: "routes/_app+/_layout",
    path: "new",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routes,
  ssr
};
