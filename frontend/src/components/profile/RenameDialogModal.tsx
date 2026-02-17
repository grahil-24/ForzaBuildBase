import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState, useEffect} from 'react'
import ButtonSpinner from '../ButtonSpinner';

export const RenameDialogModal = ({openModal, onClose,onSubmit,isLoading,isSuccess,}: {
  openModal: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  isLoading: boolean;
  isSuccess: boolean;
}) => {
  
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (!openModal) {
        setName("");
    }
  }, [openModal]);

  const close = () => {
    setName("");
    onClose();
  }

  return (
    <>
      <Dialog open={openModal} as="div" className="relative z-10 focus:outline-none" onClose={close}>
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-md rounded-xl bg-gray-100 p-6 backdrop-blur-5xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle as="h3" className="text-base/7 font-medium text-black">
                Rename Tune
              </DialogTitle>
              <p className="text-sm/6 text-black">
                Enter a new name for your tune.
              </p>
                { isSuccess ? (
                    <div className='text-green-700 mr-auto'>Tune renamed successfully!</div>
                ) : <input onChange={(e) => setName(e.target.value)}type="text" className='w-full rounded border-black border-2 outline-none'/>
                }
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  className=" inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-open:bg-gray-700"
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button
                  className=" inline-flex items-center gap-2 rounded-md bg-green-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-open:bg-gray-700"
                  onClick={() => onSubmit(name)}
                >
                    {isLoading ? (
                        <>
                            <ButtonSpinner />
                            Applying...
                        </>
                    ) : <>Apply</>
                }
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}