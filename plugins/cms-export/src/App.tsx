import type { Collection } from "framer-plugin"

import "./App.css"
import { framer } from "framer-plugin"
import { ChangeEvent, useEffect, useState } from "react"
import { exportCollectionAsCSV, convertCollectionToCSV } from "./csv"
import { PreviewTable } from "./PreviewTable"

export function App() {
    const [collections, setCollections] = useState<Collection[]>([])
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

    useEffect(() => {
        framer.showUI({
            width: 340,
            height: 370,
            resizable: false,
        })

        framer.getCollections().then(setCollections)
    }, [])

    const exportCSV = async () => {
        if (!selectedCollection) return

        exportCollectionAsCSV(selectedCollection, selectedCollection.name)
    }

    const copyCSVtoClipboard = async () => {
        if (!selectedCollection) return

        const csv = await convertCollectionToCSV(selectedCollection)

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(csv)
            } else {
                // Fallback method for browsers that don't support clipboard.writeText
                const textArea = document.createElement("textarea")
                textArea.value = csv
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand("copy")
                document.body.removeChild(textArea)
            }
            framer.notify("CSV copied to clipboard", { variant: "success" })
        } catch (error) {
            console.error("Failed to copy CSV:", error)
            framer.notify("Failed to copy CSV to clipboard", { variant: "error" })
        }
    }

    const selectCollection = (event: ChangeEvent<HTMLSelectElement>) => {
        const index = event.currentTarget.selectedIndex
        if (index === -1) return

        const collection = collections[index - 1]
        if (!collection) return

        setSelectedCollection(collection)
    }

    return (
        <div className="export-collection">
            <div className="preview-container">
                <div className={`preview-container-layer-a ${selectedCollection ? "preview-container-layer-a--hidden" : ""}`}>
                    <div className="empty-state">
                        <img className="empty-state-image" src="./splash.png" alt="" />
                        <p className="empty-state-message">Export all your CMS content to CSV files.</p>
                    </div>
                </div>

                {selectedCollection && (
                    <div className="preview-container-layer-b">
                        <PreviewTable collection={selectedCollection} />
                    </div>
                )}
            </div>

            <div className="footer">
                <select onChange={selectCollection} className={!selectedCollection ? "footer-select footer-select--unselected" : "footer-select"}>
                    <option selected disabled>
                        Select Collection…
                    </option>

                    {collections.map(collection => {
                        return <option selected={collection.id === selectedCollection?.id}>{collection.name}</option>
                    })}
                </select>

                <div className="footer-actions">
                    <button disabled={!selectedCollection} onClick={copyCSVtoClipboard}>
                        Copy
                    </button>
                    <button disabled={!selectedCollection} onClick={exportCSV}>
                        Export
                    </button>
                </div>
            </div>
        </div>
    )
}
