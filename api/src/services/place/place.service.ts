import { Service } from 'typedi';

import {
  PlaceRepository,
  ObjectInstanceRepository,
  RoleRepository,
  RoleAssignmentRepository,
} from '../../repositories';
import { Place, ObjectInstance } from '../../types/models';

/** Service for dealing with blocks */
@Service()
export class PlaceService {
  constructor(
    private placeRepository: PlaceRepository,
    private objectInstanceRepository: ObjectInstanceRepository,
    private roleRepository: RoleRepository,
    private roleAssignmentRepository: RoleAssignmentRepository,
  ) {}

  public async canAdmin(slug: string, placeId: number, memberId: number):
   Promise<boolean> {
    const placeRoleId = await this.findRoleIdsBySlug(slug);
    if (!placeRoleId) {
      throw new Error('Place roleId not found');
    } else {
      console.log(placeRoleId);
    }
    
    const roleAssignments = await this.roleAssignmentRepository.getByMemberId(memberId);
    
    if (
      roleAssignments.find(assignment => {
        return (
          [
            this.roleRepository.roleMap.Admin,
            this.roleRepository.roleMap.CityMayor,
            this.roleRepository.roleMap.DeputyMayor,
          ].includes(assignment.role_id) ||
        ([
          placeRoleId.owner,
          placeRoleId.deputy,
        ].includes(assignment.role_id) &&
         assignment.place_id === placeId)
        );
      })
    ) {
      return true;
    }
    else return false;
  }
  
  public async findById(placeId: number): Promise<Place> {
    return await this.placeRepository.findById(placeId);
  }

  public async findBySlug(slug: string): Promise<Place> {
    return await this.placeRepository.findBySlug(slug);
  }

  public async getPlaceObjects(placeId: number): Promise<ObjectInstance[]> {
    return await this.objectInstanceRepository.findByPlaceId(placeId);
  }
  
  private async findRoleIdsBySlug(slug: string): Promise<{owner: number, deputy: number}> {
    const roleId = {
      bank: {
        owner: this.roleRepository.roleMap.BankManager,
        deputy: this.roleRepository.roleMap.BankCashier,
      },
      clubs: {
        owner: this.roleRepository.roleMap.ClubsChief,
        deputy: this.roleRepository.roleMap.ClubsDeputy,
      },
      employment: {
        owner: this.roleRepository.roleMap.EmploymentChief,
        deputy: this.roleRepository.roleMap.EmploymentDeputy,
      },
      eplex: {
        owner: this.roleRepository.roleMap.ePlexChief,
        deputy: this.roleRepository.roleMap.ePlexDeputy,
      },
      flea: {
        owner: this.roleRepository.roleMap.FleaMarketChief,
        deputy: this.roleRepository.roleMap.FleaMarketDeputy,
      },
      mall: {
        owner: this.roleRepository.roleMap.BankManager,
        deputy: this.roleRepository.roleMap.BankCashier,
      },
      outlands: {
        owner: this.roleRepository.roleMap.OutlandsChief,
        deputy: this.roleRepository.roleMap.OutlandsDeputy,
      },
      postoffice: {
        owner: this.roleRepository.roleMap.PostOfficeManager,
        deputy: this.roleRepository.roleMap.PostOfficeDeputy,
      },
    };
    return roleId[slug];
  }
}
