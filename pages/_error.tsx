import React from 'react'

// Minimal Pages Router error page to satisfy Next.js build when it seeks /_error
function Error({ statusCode }: { statusCode?: number }) {
  return (
    <html>
      <head>
        <title>{statusCode ? `Error ${statusCode}` : 'Error'}</title>
        <meta name="robots" content="noindex" />
      </head>
      <body>
        <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
          <h1 style={{ marginBottom: 8 }}>
            {statusCode
              ? `An error ${statusCode} occurred on server`
              : 'An error occurred'}
          </h1>
          <p>
            Please try again later. If the problem persists, contact support.
          </p>
        </main>
      </body>
    </html>
  )
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
