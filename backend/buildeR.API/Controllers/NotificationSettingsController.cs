﻿using System.Collections.Generic;
using System.Threading.Tasks;
using buildeR.BLL.Interfaces;
using buildeR.Common.DTO.NotificationSetting;
using Microsoft.AspNetCore.Mvc;

namespace buildeR.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class NotificationSettingsController : ControllerBase
    {
        private readonly INotificationSettingService _service;
        public NotificationSettingsController(INotificationSettingService service)
        {
            _service = service;
        }

        [HttpGet("GetByUserId/{userId}")]
        public async Task<NotificationSettingDTO> GetByUserId(int userId)
        {
            return await _service.GetNotificationSettingByUserId(userId);
        }

        [HttpPut]
        public async Task<NotificationSettingDTO> Put([FromBody] NotificationSettingDTO dto)
        {
            return await _service.Update(dto);
        }
        [HttpGet]
        public async Task<IEnumerable<NotificationSettingDTO>> GetAll()
        {
            return await _service.GetAll();
        }
        [HttpGet("{id}")]
        public async Task<NotificationSettingDTO> GetById(int id)
        {
            return await _service.GetById(id);
        }

        [HttpPost]
        public async Task<NotificationSettingDTO> Post([FromBody] NewNotificationSettingDTO newNotification)
        {
            return await _service.Create(newNotification);
        }

        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await _service.Delete(id);
        }
    }
}
