'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange?: (limit: number) => void;
}

export function Pagination({
currentPage,
totalPages,
onPageChange,
itemsPerPage,
totalItems,
onItemsPerPageChange,
}: PaginationProps) {
const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
const endItem = Math.min(currentPage * itemsPerPage, totalItems);

const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    const validTotalPages = Math.max(1, totalPages);

    if (validTotalPages <= maxPagesToShow) {
        for (let i = 1; i <= validTotalPages; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(validTotalPages - 1, currentPage + 1);

        if (startPage > 2) {
            pages.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < validTotalPages - 1) {
            pages.push("...");
        }

        pages.push(validTotalPages);
    }

    return pages;
};

const itemsPerPageOptions = [1, 3, 5, 7, 10, 13, 15];
const validTotalPages = Math.max(1, totalPages);

return (
    <div className="flex items-center justify-between gap-4 pt-4 rounded-lg mt-4 flex-wrap">
        {/* Pagination Stats */}
        <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{startItem}</span> to{" "}
            <span className="font-semibold text-foreground">{endItem}</span> of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> items
        </div>

        {/* Items Per Page Dropdown */}
        {onItemsPerPageChange && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[140px] justify-between">
                        Items per page: <span className="ml-2 font-medium">{itemsPerPage}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {itemsPerPageOptions.map((option) => (
                        <DropdownMenuItem
                            key={option}
                            onClick={() => onItemsPerPageChange(option)}
                            className={option === itemsPerPage ? "bg-accent font-bold" : ""}
                        >
                            {option}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
                aria-label="Go to previous page"
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </Button>

            <div className="flex gap-1">
                {getPageNumbers().map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-3 py-1 text-muted-foreground select-none"
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page as number)}
                            className={`w-9 h-9 p-0 min-w-[36px] ${
                                currentPage === page ? "ring-2 ring-primary" : ""
                            }`}
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
                        >
                            {page}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= validTotalPages}
                className="gap-1"
                aria-label="Go to next page"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    </div>
);
}
