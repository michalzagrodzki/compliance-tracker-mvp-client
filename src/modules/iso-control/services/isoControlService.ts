/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/modules/api/http";
import type { IsoControl, IsoControlListRequest } from "../types";

const ISO_CONTROL_ENDPOINTS = {
  LIST: "/v1/iso-controls",
  BY_ID: (controlId: string) => `/v1/iso-controls/id/${controlId}`,
  BY_NAME: (name: string) =>
    `/v1/iso-controls/name/${encodeURIComponent(name)}`,
} as const;

class IsoControlService {
  async getControls(params: IsoControlListRequest = {}): Promise<IsoControl[]> {
    const { skip = 0, limit = 10, name_filter } = params;

    const queryParams: Record<string, any> = {
      skip,
      limit,
    };

    if (name_filter) {
      queryParams.name_filter = name_filter;
    }

    const response = await http.get<IsoControl[]>(ISO_CONTROL_ENDPOINTS.LIST, {
      params: queryParams,
    });
    return response.data;
  }

  async getControlById(controlId: string): Promise<IsoControl> {
    const response = await http.get<IsoControl>(
      ISO_CONTROL_ENDPOINTS.BY_ID(controlId)
    );
    return response.data;
  }

  async getControlByName(name: string): Promise<IsoControl> {
    const response = await http.get<IsoControl>(
      ISO_CONTROL_ENDPOINTS.BY_NAME(name)
    );
    return response.data;
  }

  // Helper method for searching controls with pagination
  async searchControls(
    searchTerm: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<IsoControl[]> {
    return this.getControls({
      skip,
      limit,
      name_filter: searchTerm,
    });
  }

  // Helper method to get all controls (with pagination handling)
  async getAllControls(batchSize: number = 50): Promise<IsoControl[]> {
    let allControls: IsoControl[] = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await this.getControls({
        skip,
        limit: batchSize,
      });

      allControls = [...allControls, ...batch];

      // If we got fewer results than requested, we've reached the end
      hasMore = batch.length === batchSize;
      skip += batchSize;
    }

    return allControls;
  }
}

export const isoControlService = new IsoControlService();
