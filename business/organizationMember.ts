//
// Copyright (c) Microsoft.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
//

import { Organization } from "./organization";
import { Operations } from "./operations";
import { ICorporateLink } from './corporateLink';

export class OrganizationMember {
  private _organization: Organization;
  private _operations: Operations;
  private _organizationProfile: any;
  private _entity;

  // TODO: review this decision, it's used by MemberSearch APIs.
  public link: ICorporateLink; // Allow get and set on the object
  public corporate: any;

  constructor(organization: Organization, entity: any, operations: Operations) {
    this._organization = organization;
    if (entity) {
      this._entity = entity;
    }
    // Organization accounts have a plan
    if (entity && entity.plan) {
      this._organizationProfile = entity;
    }
    this._operations = operations;
  }

  get id(): number {
    return this._entity.id as number;
  }

  get login(): string {
    return this._entity.login;
  }

  get avatar_url(): string {
    return this._entity.avatar_url;
  }

  getEntity() {
    return this._entity;
  }

  getProfileCreatedDate(): Date {
    // legacy method that should probably be removed
    if (this._entity.created_at) {
      return new Date(this._entity.created_at);
    }
  }

  getProfileUpdatedDate(): Date {
    // legacy method that should probably be removed
    if (this._entity.updated_at) {
      return new Date(this._entity.updated_at);
    }
  }

  get organizationProfile() {
    return this._organizationProfile;
  }

  get permissions(): any {
    return this._entity.permissions;
  }

  // ----------------------------------------------------------------------------
  // Retrieves the URL for the user's avatar, if present. If the user's details
  // have not been loaded, we will not yet have an avatar URL.
  // ----------------------------------------------------------------------------
  avatar(optionalSize: number) {
    if (!optionalSize) {
      optionalSize = 80;
    }
    if (this.avatar_url) {
      return this.avatar_url + '&s=' + optionalSize;
    }
  }

  async getMailAddress(): Promise<string> {
    // duplicated code in organizationMember and teamMember
    if (!this.id) {
      throw new Error('No organization member ID');
    }
    const link = await this._operations.getLinkByThirdPartyId(String(this.id));
    if (!link || !link.corporateId) {
      throw new Error(`Organization member ID ${this.id} is not linked.`);
    }
    if (!link.corporateUsername) {
      throw new Error(`Organization member ID ${this.id} is linked to corporate ID ${link.corporateId} but does not have a corporate username.`);
    }
    const providers = this._operations.providers;
    if (!providers.mailAddressProvider) {
      throw new Error('No mailAddressProvider is available in this application instance');
    }
    return providers.mailAddressProvider.getAddressFromUpn(link.corporateUsername);
  }
}
