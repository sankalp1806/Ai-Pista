import type { Contributor } from "@/lib/types";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { CircleDot, CircleDotDashed, GithubIcon, Undo2 } from "lucide-react";

export const metadata: Metadata = {
    title: "Aura Farmers of Ai-Pista",
    description: "Meet the amazing aura farmers who nurture the energy behind Ai-Pista",
};


async function getContributors(): Promise<Contributor[]> {
    try {
        const response = await fetch(
            "https://api.github.com/repos/NiladriHazra/Ai-Pista/contributors",
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "Ai-Pista-Web-App",
                },
                next: { revalidate: 600 },
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch contributors");
            return [];
        }

        const contributors = (await response.json()) as Contributor[];

        const filteredContributors = contributors.filter(
            (contributor: Contributor) => contributor.type === "User"
        );

        return filteredContributors;
    } catch (error) {
        console.error("Error fetching contributors:", error);
        return [];
    }
}

export default async function Contributors() {
    const contributors = await getContributors();
    const topContributors = contributors.slice(0, 2);
    const otherContributors = contributors.slice(2);

    return (
        <>
            <main className="bg-[#0a0a0a] relative z-0 mx-auto flex min-h-screen w-full max-w-full flex-col gap-16 px-6 py-20 text-white">
                {/* Back Button */}
                <div className="absolute top-6 left-6">
                    <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors font-semibold">
                        <Undo2 size={16} />
                        Back
                    </Link>
                </div>
                {/* Top 2 Contributors */}
                {topContributors.length > 0 && (
                    <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-12 px-6 pt-2">
                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                            <div className="flex items-center justify-center gap-6 text-sm text-white/90">
                                <Link href={"https://github.com/NiladriHazra/Ai-Pista"} target="_blank" rel="noopener noreferrer">
                                    <Badge variant="secondary" className="gap-2 mb-6 p-[6px]">
                                        <GithubIcon className="h-3 w-3" />
                                        Open Source
                                    </Badge>
                                </Link>
                                <Link href={"https://runable.com/"} target="_blank" rel="noopener noreferrer">
                                    <Badge variant="secondary" className="gap-2 mb-6 p-[6px]">
                                        <CircleDotDashed className="h-3 w-3" />
                                        Backed by Runable
                                    </Badge>
                                </Link>
                            </div>
                            <h1 className="font-lora text-white text-4xl font-bold">
                                Lead Aura Farmers
                            </h1>
                            <p className="text-muted-foreground max-w-md text-lg">
                                The farmers who cultivated the most auras for Ai-Pista
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-8 text-sm text-white/90">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full" />
                                <span className="font-medium">{contributors.length}</span>
                                <span className="text-white/70">aura farmers</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full" />
                                <span className="font-medium">{contributors.reduce((sum, c) => sum + c.contributions, 0)}</span>
                                <span className="text-white/70">contributions</span>
                            </div>
                        </div>

                        <div className="flex w-full flex-row justify-center gap-8">
                            {topContributors.map((contributor) => (
                                <Link
                                    key={contributor.id}
                                    href={contributor.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#0a0a0a] hover:border-white/20 flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-neutral-800 px-8 py-8 transition-all duration-300"
                                >
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            src={contributor.avatar_url}
                                            alt={`${contributor.login}'s avatar`}
                                        />
                                        <AvatarFallback className="text-lg font-medium">
                                            {contributor.login.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <p className="text-white text-lg font-semibold">
                                            {contributor.login}
                                        </p>
                                        <p className="text-white/70 text-sm">
                                            {contributor.contributions} contributions
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Contributors */}
                <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-12 px-6">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <h2 className="font-lora text-white text-3xl font-bold">
                            Aura Farming Community
                        </h2>
                        <p className="text-white/70 max-w-md text-base">
                            Every aura sown matters. Meet the community behind Ai-Pista.
                        </p>
                    </div>

                    {otherContributors.length > 0 && (
                        <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {otherContributors.map((contributor) => (
                                <Link
                                    key={contributor.id}
                                    href={contributor.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:border-ring group flex flex-col items-center gap-3 rounded-xl p-4 transition-colors duration-200"
                                >
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage
                                            src={contributor.avatar_url}
                                            alt={`${contributor.login}'s avatar`}
                                        />
                                        <AvatarFallback className="text-sm font-medium">
                                            {contributor.login.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <p className="text-white group-hover:text-white w-full truncate text-sm font-medium transition-colors">
                                            {contributor.login}
                                        </p>
                                        <p className="text-white/70 text-sm">
                                            {contributor.contributions} Aura
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 pt-10 border-t border-neutral-800">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <h3 className="font-lora text-white text-2xl font-bold">
                            Ready to Farm Your Aura?
                        </h3>
                        <p className="text-white/70 max-w-md text-base">
                            Join our community and help build the future together.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button asChild variant="default" size="lg">
                            <Link
                                href="https://github.com/NiladriHazra/Ai-Pista"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <GithubIcon className="h-3 w-3" />
                                Start Farming
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="lg">
                            <Link
                                href="https://github.com/NiladriHazra/Ai-Pista/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <CircleDot className="h-3 w-3" />
                                Browse Aura Tasks
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
        </>
    );
}

