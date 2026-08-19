import React, { useEffect } from 'react'
import { useSandpack } from '@codesandbox/sandpack-react'

const SandpackErrorMonitor = ({ onErrorChange }) => {
  const { sandPack } = useSandPack()
  const { error } = sandPack;

  useEffect(() => {
    if (error) {
      const msg = error.message || "";
      const isNetworkError =
        msg.includes("failed to fetch") ||
        msg.includes("col.csbops.io") ||
        msg.includes("ERR_CONNECTION_TIMED_OUT") ||
        msg.includes("net ::ERR");

      if (isNetworkError) {
        onErrorChange(false);
        return
      }
    }
    onErrorChange(true)
  }, [error, onErrorChange])
  return null
}


export default SandpackErrorMonitor