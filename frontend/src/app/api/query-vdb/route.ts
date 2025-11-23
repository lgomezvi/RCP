import { NextRequest, NextResponse } from "next/server";
import { CloudClient, Collection, Metadata } from "chromadb";

interface AddDataRequest {
	ids: string[];
	documents: string[];
	metadatas: Metadata[];
}

const chromaClient = new CloudClient();

let myCollection: Collection | null = null;

const getMyCollection = async () => {
	if (!myCollection) {
		myCollection = await chromaClient.getOrCreateCollection({
			name: "myCollection",
		});
	}
	return myCollection;
};

export async function POST(request: NextRequest) {
	try {
		const data: AddDataRequest = await request.json();
		const collection = await getMyCollection();

		await collection.add({
			ids: data.ids,
			documents: data.documents,
			metadatas: data.metadatas,
		});

		return NextResponse.json({
			success: true,
			message: "Data added successfully",
			data,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, message: "Failed to add data" },
			{ status: 500 },
		);
	}
}

