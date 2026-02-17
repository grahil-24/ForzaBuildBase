import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useState } from "react";

const ShareTuneDialogComponent = ({isShareDialogOpen, handleDialogClose, url}: {isShareDialogOpen: boolean, handleDialogClose: () => void, url: string}) => {

    const [copied, setCopied] = useState<boolean>(false);

    const copyURLToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }

    return (
        <Dialog open={isShareDialogOpen} as="div" className="relative z-10 focus:outline-none" 
        onClose={handleDialogClose}
        >
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                <DialogPanel
                    transition
                    className="w-full max-w-xl rounded-xl bg-white shadow-2xl border-black/10 border p-4 backdrop-blur-4xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
                >
                    <div className='flex'>
                    <DialogTitle as="h3" className="text-base/7 font-medium text-black">
                        Share
                    </DialogTitle>
                    <button
                        onClick={handleDialogClose}
                        className="ml-auto  text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Close dialog"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                    </div>
                    <div className='border border-gray-200 rounded-xl p-2 flex justify-between mt-5 text-sm items-center'>
                    <div>
                        <code className="text-sm text-slate-700 break-all">
                        {url}
                        </code>
                    </div>
                    <button onClick={() => copyURLToClipboard(url)}className=' bg-blue-600 text-white px-4 py-2 rounded-3xl font-bold'>
                        {copied ? '✓ Copied' : 'Copy'}
                    </button>
                    </div>
                </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default ShareTuneDialogComponent;
