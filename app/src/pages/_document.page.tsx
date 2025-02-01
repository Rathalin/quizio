import { Html, Head, Main, NextScript, DocumentContext, DocumentProps } from 'next/document';
import * as React from 'react';
import { DocumentHeadTags, DocumentHeadTagsProps, documentGetInitialProps } from '@mui/material-nextjs/v15-pagesRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

export default function MyDocument(props: DocumentProps & DocumentHeadTagsProps) {
  return (
    <Html>
      <Head>
        <DocumentHeadTags {...props} />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <body>
        <InitColorSchemeScript attribute="class" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
