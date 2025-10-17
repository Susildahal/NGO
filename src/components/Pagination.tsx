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
const startItem = (currentPage - 1) * itemsPerPage + 1;
const endItem = Math.min(currentPage * itemsPerPage, totalItems);

const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        pages.push(1);

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        if (startPage > 2) {
            pages.push("...");
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages - 1) {
            pages.push("...");
        }

        pages.push(totalPages);
    }

    return pages;
};

const itemsPerPageOptions = [1, 3, 5, 7, 10, 13, 15];

return (
    <div className="flex flex-col gap-6 pt-4 rounded-lg  mt-4">
        {/* Pagination Stats and Items Per Page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">{startItem}</span> to{" "}
                <span className="font-semibold text-foreground">{endItem}</span> of{" "}
                <span className="font-semibold text-foreground">{totalItems}</span> items
            </div>

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
        <div className="flex items-center justify-center gap-2 flex-wrap">
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
                disabled={currentPage === totalPages}
                className="gap-1"
                aria-label="Go to next page"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
         </div>
    </div>
);
}
