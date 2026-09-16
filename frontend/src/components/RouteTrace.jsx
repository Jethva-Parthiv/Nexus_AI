import React from 'react'
import { ArrowRightIcon, CheckCircleIcon, AlertTriangleIcon } from './Icons.jsx'

/**
 * Signature routing trace component showing step-by-step hops
 * across LLM providers and why fallback occurred.
 */
export default function RouteTrace({ trace }) {
  if (!trace || trace.length === 0) return null

  return (
    <div className="route-trace" aria-label="Fallback Routing Trace">
      {trace.map((hop, i) => {
        const isSuccess = hop.outcome === 'success' || hop.status === 200
        return (
          <React.Fragment key={`${hop.provider}-${i}`}>
            <div
              className={`route-trace__hop ${
                isSuccess ? 'route-trace__hop--success' : 'route-trace__hop--failed'
              }`}
              title={
                isSuccess
                  ? `${hop.provider} responded successfully (200 OK)`
                  : `${hop.provider} returned ${hop.status} (${
                      hop.status === 429 ? 'Rate Limited' : 'Service Unavailable'
                    }) — fell back to next provider`
              }
            >
              {isSuccess ? (
                <CheckCircleIcon size={13} />
              ) : (
                <AlertTriangleIcon size={13} />
              )}
              <span className="route-trace__provider">{hop.provider}</span>
              <span className="route-trace__status">
                {isSuccess ? '200 OK' : `${hop.status} ${hop.status === 429 ? 'RateLimit' : 'Error'}`}
              </span>
            </div>
            {i < trace.length - 1 && (
              <span className="route-trace__connector">
                <ArrowRightIcon size={14} />
              </span>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
